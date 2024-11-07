import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from './Modal';
import DecayModal from './DecayModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faRotateRight, faMoon } from '@fortawesome/free-solid-svg-icons';

// Import rank images
import challengerImg from './assets/ranked-emblem/emblem-challenger.png';
import gmImg from './assets/ranked-emblem/emblem-grandmaster.png';
import mImg from './assets/ranked-emblem/emblem-master.png';
import diaImg from './assets/ranked-emblem/emblem-diamond.png';
import emeraldImg from './assets/ranked-emblem/emblem-platinum.png';
import goldImg from './assets/ranked-emblem/emblem-gold.png';
import silverImg from './assets/ranked-emblem/emblem-silver.png';
import bronzeImg from './assets/ranked-emblem/emblem-bronze.png';
import ironImg from './assets/ranked-emblem/emblem-iron.png';

// Import Ranked Borders
import challengerBorder from './assets/ranked-emblem/wings/wings_challenger.png';
import gMasterBorder from './assets/ranked-emblem/wings/wings_grandmaster.png';
import masterBorder from './assets/ranked-emblem/wings/wings_master.png';
import diamondBorder from './assets/ranked-emblem/wings/wings_diamond.png';
import emeraldBorder from './assets/ranked-emblem/wings/wings_platinum.png';
import goldBorder from './assets/ranked-emblem/wings/wings_gold.png';
import silverBorder from './assets/ranked-emblem/wings/wings_silver.png';
import bronzeBorder from './assets/ranked-emblem/wings/wings_bronze.png';
import ironBorder from './assets/ranked-emblem/wings/wings_iron.png';

function App() {
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [profileIcons, setProfileIcons] = useState({});
  const [championData, setChampionData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [unsortedPlayers, setUnsortedPlayers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [decayModalOpen, setDecayModalOpen] = useState(false);
  const [decayDays, setDecayDays] = useState(0);
  const [currentPlayerKey, setCurrentPlayerKey] = useState(null);
  const [profileIconId, setProfileIconId] = useState(null);
  const [currentPlayerGameName, setCurrentPlayerGameName] = useState('');
  const [currentPlayerTagLine, setCurrentPlayerTagLine] = useState('');
  const [currentCredentials, setCurrentCredentials] = useState({ username: '', password: '' });
  const [currentTier, setCurrentTier] = useState('UNRANKED');
  const [, forceRender] = useState(0);

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
        })
        .catch((err) => {
        });
    } else {
    }
  };

  // Sort players, placing favorited ones at the top
  const sortPlayersWithFavorites = (players) => {
    return [...players].sort((a, b) => {
      if (a.favorite === b.favorite) {
        return 0;
      }
      return a.favorite ? -1 : 1;
    });
  };


    
  const assignDecayDays = (player) => {
    const tier = player.leagueData?.[0]?.tier || "UNRANKED";
  
    // Set default decay days only for Diamond and above ranks if decayDaysLeft is not yet defined
    if (player.decayDaysLeft === undefined) {
      if (tier === "DIAMOND") {
        return 28;
      } else if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
        return 14;
      } else {
        return 0; // Ensure decay is set to 0 for other tiers
      }
    }
  
    return player.decayDaysLeft; // Keep the existing value if already defined
  };

  const onUpdatePlayerData = (updateFunction) => {
    setPlayerData((prevData) => {
      const updatedData = updateFunction(prevData);
      setSortedPlayers(sortPlayersWithFavorites(Object.values(updatedData)));
      return updatedData;
    });
  };
  
  
  
  
const fetchData = async () => {
  try {
    // Fetch player data
    const playerResponse = await axios.get('http://localhost:3001/players');
    const data = playerResponse.data;

    // Process each player to set decay days if needed and reapply credentials from local storage
    const updatedData = Object.fromEntries(
      Object.entries(data).map(([key, player]) => {
        const tier = player.leagueData?.[0]?.tier || "UNRANKED";

        // Set decay days based on rank
        let decayDaysLeft;
        if (tier === "DIAMOND") {
          decayDaysLeft = player.decayDaysLeft ?? 28;
        } else if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
          decayDaysLeft = player.decayDaysLeft ?? 14;
        } else {
          decayDaysLeft = 0; // Ensure lower tiers have decay days set to 0
        }

        // Retrieve stored credentials from local storage, if available
        const storedCredentials = JSON.parse(localStorage.getItem(`credentials-${key}`)) || player.credentials;

        return [key, { 
          ...player, 
          decayDaysLeft,
          credentials: storedCredentials // Ensure credentials are preserved or reapplied
        }];
      })
    );

    setPlayerData(updatedData);

    // Sort players by favorite status with favorites at the top
    const sortedData = sortPlayersWithFavorites(Object.values(updatedData));
    setSortedPlayers(sortedData);

    // Fetch profile icons
    const profileIconsResponse = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/profileicon.json');
    setProfileIcons(profileIconsResponse.data.data);

    // Fetch champion data
    const championDataResponse = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json');
    setChampionData(championDataResponse.data.data);

  } catch (error) {
    console.error('Error fetching data:', error);
    setErrorMessage('Error fetching cached player data');
  }
};

  useEffect(() => {
  
    fetchData();
  }, []);



  const getSoloQueueData = (leagueData) => {
    if (leagueData) {
      return leagueData.find((queue) => queue.queueType === 'RANKED_SOLO_5x5');
    }
    return null;
  };

  const getProfileIconUrl = (profileIconId) => {
    const version = '14.17.1';
  
    // Check if profileIconId exists in profileIcons data
    if (profileIconId && profileIcons[profileIconId]) {
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
      return url;
    }
  
    // Log missing icon IDs and provide a fallback image
    console.warn(`Profile icon not found for ID: ${profileIconId}`);
    return 'path/to/default-icon.png';  // Set path to your default/fallback icon image
  };
  
  

  const getRankImage = (rank) => {
    switch (rank) {
      case 'CHALLENGER':
        return challengerImg;
      case 'GRANDMASTER':
        return gmImg;
      case 'MASTER':
        return mImg;
      case 'DIAMOND':
        return diaImg;
      case 'EMERALD':
      case 'PLATINUM':
        return emeraldImg;
      case 'GOLD':
        return goldImg;
      case 'SILVER':
        return silverImg;
      case 'BRONZE':
        return bronzeImg;
      case 'IRON':
        return ironImg;
      default:
        return null;
    }
  };

  const getRankBorder = (tier) => {
    switch (tier) {
      case 'CHALLENGER':
        return challengerBorder;
      case 'GRANDMASTER':
        return gMasterBorder;
      case 'MASTER':
        return masterBorder;
      case 'DIAMOND':
        return diamondBorder;
      case 'EMERALD':
      case 'PLATINUM':
        return emeraldBorder;
      case 'GOLD':
        return goldBorder;
      case 'SILVER':
        return silverBorder;
      case 'BRONZE':
        return bronzeBorder;
      case 'IRON':
        return ironBorder;
      default:
        return masterBorder; 
    }
  };

  const getCurrentTime = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0'); 
    const hours = date.getHours().toString().padStart(2, '0'); 
    const minutes = date.getMinutes().toString().padStart(2, '0'); 

    return { day, hours, minutes };
  };

  const calculateWinRate = (wins, losses) => {
    if (wins + losses === 0) return 0;
    return ((wins / (wins + losses)) * 100).toFixed(2);
  };

  const sortByRankLowToHigh = (data) => {
    const rankOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];

    return Object.keys(data)
      .map((key) => {
        const player = data[key];
        const soloQueueData = getSoloQueueData(player.leagueData);
        return { ...player, soloQueueData };
      })
      .filter((player) => player.soloQueueData)
      .sort((a, b) => {
        const rankA = rankOrder.indexOf(a.soloQueueData.tier);
        const rankB = rankOrder.indexOf(b.soloQueueData.tier);

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        return a.soloQueueData.leaguePoints - b.soloQueueData.leaguePoints;
      });
  };

  const sortByRankHighToLow = (data) => {
    const rankOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];

    return Object.keys(data)
      .map((key) => {
        const player = data[key];
        const soloQueueData = getSoloQueueData(player.leagueData);
        return { ...player, soloQueueData };
      })
      .filter((player) => player.soloQueueData)
      .sort((a, b) => {
        const rankA = rankOrder.indexOf(a.soloQueueData.tier);
        const rankB = rankOrder.indexOf(b.soloQueueData.tier);

        if (rankA !== rankB) {
          return rankB - rankA;
        }

        return b.soloQueueData.leaguePoints - a.soloQueueData.leaguePoints;
      });
  };

  const sortByDecayLowToHigh = (data) => {
    return Object.keys(data)
      .map((key) => data[key])
      .filter((player) => player.decayDaysLeft !== undefined)
      .sort((a, b) => a.decayDaysLeft - b.decayDaysLeft);
  };

  const sortByDecayHighToLow = (data) => {
    return Object.keys(data)
      .map((key) => data[key])
      .filter((player) => player.decayDaysLeft !== undefined)
      .sort((a, b) => b.decayDaysLeft - a.decayDaysLeft);
  };

  const getChampionIconUrl = (championName) => {
    if (!championData || Object.keys(championData).length === 0) {
      console.warn('Champion data is not loaded yet.');
      return null;
    }
  
    // Normalize input to match key case
    const normalizedChampionName = championName.toLowerCase();
  
    // Find champion with case-insensitive match
    const champion = Object.values(championData).find(
      (champ) => champ.id.toLowerCase() === normalizedChampionName
    );
  
    if (champion) {
      const url = `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/champion/${champion.image.full}`;
      return url;
    }
  
    console.warn(`Champion data not found for: ${championName}. Available champions:`, Object.keys(championData));
    return null;
  };
  


  // Delete a player from playerData
  const onDeletePlayer = (playerKey) => {
    setPlayerData((prevData) => {
      const newData = { ...prevData };
      delete newData[playerKey];
      return newData;
    });
  };

  const openModal = (playerKey) => {
    const normalizedKey = playerKey.replace(/\s+/g, '').toLowerCase();
    const selectedPlayer = playerData[normalizedKey];
  
    if (!selectedPlayer || !selectedPlayer.summonerData) {
      console.error('Player data or summonerData not found for key:', normalizedKey);
      return;
    }
  
    const soloQueueData = getSoloQueueData(selectedPlayer.leagueData);
    const tier = soloQueueData?.tier || 'UNRANKED';
  
    setCurrentPlayerKey(normalizedKey);
    setProfileIconId(selectedPlayer.summonerData.profileIconId);
    setCurrentPlayerGameName(selectedPlayer.gameName);
    setCurrentPlayerTagLine(selectedPlayer.tagLine);
    setModalOpen(true);
    setCurrentTier(tier);
  };
  
  const openDecayModal = (playerKey) => {
    const normalizedKey = playerKey.replace(/\s+/g, '').toLowerCase();


    const selectedPlayer = playerData[normalizedKey];

    if (!selectedPlayer || selectedPlayer.decayDaysLeft === undefined) {
      console.error(`Player data not found for key: ${normalizedKey}`);
      return;
    }

    setCurrentPlayerKey(normalizedKey);
    setDecayDays(selectedPlayer.decayDaysLeft || 0);
    setDecayModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentPlayerKey(null);
  };

  const handleSaveCredentials = (credentials) => {
    const updatedPlayerData = {
      ...playerData,
      [currentPlayerKey]: {
        ...playerData[currentPlayerKey],
        credentials: {
          username: credentials.username,
          password: credentials.password,
        },
      },
    };
  
    setPlayerData(updatedPlayerData);
    setCurrentCredentials(credentials);
  
    // Save credentials to local storage
    localStorage.setItem(`credentials-${currentPlayerKey}`, JSON.stringify(credentials));
  
    axios
      .post('http://localhost:3001/update', {
        playerKey: currentPlayerKey,
        data: updatedPlayerData[currentPlayerKey],
      })
      .then(() => {
        forceRender((prev) => prev + 1);
      })
      .catch((error) => {
      });
  
    closeModal();
  };
  

  const handleSaveDecayDays = (days) => {

    const updatedPlayerData = {
      ...playerData,
      [currentPlayerKey]: {
        ...playerData[currentPlayerKey],
        decayDaysLeft: days,
      },
    };

    setPlayerData(updatedPlayerData);

    const updatedSortedPlayers = Object.keys(updatedPlayerData).map((key) => updatedPlayerData[key]);
    setSortedPlayers(updatedSortedPlayers);

    forceRender((prev) => prev + 1);

    axios
      .post('http://localhost:3001/update-decay', { playerKey: currentPlayerKey, decayDays: days })
      .then(() => {
        setDecayModalOpen(false);
      })
      .catch((error) => {
      });
  };

  const handleResetCredentials = () => {
    const updatedPlayerData = {
      ...playerData,
      [currentPlayerKey]: {
        ...playerData[currentPlayerKey],
        credentials: null,
      },
    };

    setPlayerData(updatedPlayerData);
    setCurrentCredentials({ username: '', password: '' });

    axios
      .post('http://localhost:3001/reset-credentials', { playerKey: currentPlayerKey })
      .then(() => {
      })
      .catch((error) => {
      });

    closeModal();
  };

  const handleSortRankHighToLow = () => {
    const sorted = sortByRankHighToLow(playerData);
    setSortedPlayers(sorted);
  };

  const handleSortRankLowToHigh = () => {
    const sorted = sortByRankLowToHigh(playerData);
    setSortedPlayers(sorted);
  };

  const handleSortDecayLowToHigh = () => {
    const sorted = sortByDecayLowToHigh(playerData);
    setSortedPlayers(sorted);
  };

  const handleSortDecayHighToLow = () => {
    const sorted = sortByDecayHighToLow(playerData);
    setSortedPlayers(sorted);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const setInitialDecayDays = (tier) => {
    if (tier === "DIAMOND") {
      return 28;
    } else if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
      return 14;
    }
    return 0; // Default for other tiers
  };


  
  const searchForPlayer = (event) => {
    event.preventDefault();
  
    const trimmedSearchText = searchText.trim().replace(/\s+/g, '');
    const [riotID, tagline] = trimmedSearchText.split('#');
  
    if (!riotID || !tagline) {
      setErrorMessage('Please enter both RiotID and Tagline in the format: RiotID#Tagline');
      return;
    }
  
    setErrorMessage('');
  
    const APICallString = `http://localhost:3001/search/${riotID}/${tagline}`;
    const currentTime = getCurrentTime();
  
    axios
      .get(APICallString)
      .then((response) => {
        const normalizedKey = `${riotID}-${tagline}`.toLowerCase();
  
        // Determine initial decayDaysLeft based on rank
        const playerTier = response.data.leagueData?.[0]?.tier || "UNRANKED";
        let initialDecayDays;
  
        if (playerTier === "DIAMOND") {
          initialDecayDays = 28;
        } else if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(playerTier)) {
          initialDecayDays = 14;
        } else {
          initialDecayDays = 0; // No decay for ranks below Diamond
        }
  
        // If player already exists, keep their existing decayDaysLeft; otherwise, set initialDecayDays
        const existingPlayer = playerData && playerData[normalizedKey];
        const decayDaysLeft = existingPlayer ? existingPlayer.decayDaysLeft : initialDecayDays;
  
        const updatedPlayerData = {
          ...playerData,
          [normalizedKey]: {
            ...response.data,
            decayDaysLeft: decayDaysLeft,
            lastSearchTime: currentTime,
          },
        };
  
        setPlayerData(updatedPlayerData);
  
        // Convert to array, add the new player at the end of the array
        const updatedUnsortedPlayers = Object.keys(updatedPlayerData).map((key) => updatedPlayerData[key]);
        const searchedPlayer = updatedUnsortedPlayers.find(
          (player) => `${player.gameName}-${player.tagLine}`.toLowerCase() === normalizedKey
        );
  
        const otherPlayers = updatedUnsortedPlayers.filter(
          (player) => `${player.gameName}-${player.tagLine}`.toLowerCase() !== normalizedKey
        );
  
        // Place the searched player at the end of the list
        setSortedPlayers([...otherPlayers, searchedPlayer]);
  
        forceRender((prev) => prev + 1);
      })
      .catch((error) => {
        setErrorMessage('Error fetching player data. Please check the Riot ID and Tagline.');
        console.error('Error fetching player data:', error.response ? error.response.data : error.message);
      });
  };

  const handleDecayRefresh = async (playerKey) => {
    const normalizedKey = playerKey.replace(/\s+/g, '').toLowerCase();
  
    if (!playerData) {
      console.error("Player data is not loaded.");
      return;
    }
  
    const player = playerData[normalizedKey];
    if (!player) {
      console.error(`Player not found for key ${normalizedKey}`);
      return;
    }
  
    const currentTime = getCurrentTime();
    const APICallString = `http://localhost:3001/search/${player.gameName}/${player.tagLine}`;
  
    try {
      const response = await axios.get(APICallString);
  
      const newRankedSoloMatches = response.data.rankedSoloMatches || [];
      const previousMatches = player.rankedSoloMatches || [];
      const previousMatchIds = previousMatches.map((match) => match.matchId);
      const newMatches = newRankedSoloMatches.filter(
        (match) => !previousMatchIds.includes(match.matchId)
      );
  
      const playerTier = response.data.leagueData?.[0]?.tier;
      let maxDecayDays;
  
      if (playerTier === "DIAMOND") {
        maxDecayDays = 28;
      } else if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(playerTier)) {
        maxDecayDays = 14;
      } else {
        maxDecayDays = 0; // No decay for ranks below Diamond
      }
  
      let updatedDecayDays = player.decayDaysLeft;
  
      if (newMatches.length > 0 && maxDecayDays > 0) {
        updatedDecayDays = Math.min(player.decayDaysLeft + newMatches.length, maxDecayDays);
      }
  
      const storedCredentials = JSON.parse(localStorage.getItem(`credentials-${normalizedKey}`));
  
      // Explicitly keep the existing favorite status
      const updatedPlayer = {
        ...response.data,
        decayDaysLeft: updatedDecayDays,
        lastSearchTime: currentTime,
        rankedSoloMatches: [...newRankedSoloMatches],
        credentials: storedCredentials || player.credentials,
        favorite: player.favorite, // Preserve favorite status
      };
  
      const updatedPlayerData = {
        ...playerData,
        [normalizedKey]: updatedPlayer,
      };
  
      setPlayerData(updatedPlayerData);
      setSortedPlayers([...Object.values(updatedPlayerData)]);
  
      await axios.post("http://localhost:3001/update-decay", {
        playerKey: normalizedKey,
        decayDays: updatedDecayDays,
        lastSearchTime: currentTime,
      });
  
      console.log("Decay days, lastSearchTime, and rankedSoloMatches updated successfully!");
  
    } catch (error) {
      console.error("Error fetching updated player data for ranked solo matches:", error);
    }
  };
  
  

  const renderPlayerData = () => {
    console.log("Current sortedPlayers:", sortedPlayers); // Log sortedPlayers to check contents
    if (!playerData || !sortedPlayers) return null; // Ensure data is loaded
  
    return sortedPlayers.map((player, index) => {
      if (!player) return null; // Ensure player is defined
  
      const playerKey = `${player.gameName}-${player.tagLine}`.toLowerCase().replace(/\s+/g, '');
      const selectedPlayer = playerData[playerKey];
      
  
      if (!selectedPlayer) {
        console.warn(`Player data not found for key: ${playerKey}`);
        return null;
      }
  
      const { credentials, rankedSoloMatches = [] } = selectedPlayer; // Ensure using selectedPlayer data
      const hasCredentials = credentials && credentials.username && credentials.password;
      const soloQueueData = getSoloQueueData(selectedPlayer.leagueData);
      const uniqueKey = `${player.gameName}-${player.tagLine}`.replace(/\s+/g, '').toLowerCase();
  
      // Handle cases where summonerData might not be available
      if (!selectedPlayer.summonerData) {
        return (
          <div key={index} className="player-data">
            <h3>{player.gameName}#{player.tagLine}</h3>
            <p>No summoner data available</p>
            <button onClick={() => openModal(uniqueKey)}>
              {hasCredentials ? 'Display Credentials' : 'Add Credentials'}
            </button>
          </div>
        );
      }
  
      const profileIconUrl = getProfileIconUrl(selectedPlayer.summonerData.profileIconId);
      const isRanked = !!soloQueueData;
      const playerRank = isRanked ? `${soloQueueData.tier} ${soloQueueData.rank}` : 'UNRANKED';
      const leaguePoints = isRanked ? `${soloQueueData.leaguePoints}LP` : '';
      const wins = isRanked ? soloQueueData.wins : 0;
      const losses = isRanked ? soloQueueData.losses : 0;
      const winRate = isRanked ? calculateWinRate(wins, losses) : 'N/A';
      const rankBorder = isRanked ? getRankBorder(soloQueueData.tier) : getRankBorder('UNRANKED');
  
      return (
        <div key={index} className="player-data">
          <button className="credentials-button" onClick={() => openModal(uniqueKey)}>
            <FontAwesomeIcon icon={faEllipsis} size="3x" color="white" />
          </button>
          <div className='data-cont'>
            <div className="player-profile">
              <div className="icon-container-app">
                <img className="border-image-app" src={rankBorder} alt={`${playerRank} Border`} />
                {profileIconUrl && (
                  <img className="icon-modal-app" src={profileIconUrl} alt="Profile Icon" />
                )}
              </div>
              <div className='user-pass-copy'>
                <button
                  className='clipboard-btn'
                  onClick={() => {
                    const username = selectedPlayer.credentials?.username;
                    copyToClipboard(username || 'No username');
                  }}
                >
                  user
                </button>
  
                <button
                  className='clipboard-btn'
                  onClick={() => {
                    const password = selectedPlayer.credentials?.password;
                    copyToClipboard(password || 'No password');
                  }}
                >
                  pass
                </button>
              </div>
            </div>
  
            <div className='container-player-info'>
              <h3 className="game-name">{player.gameName}#{player.tagLine}</h3>
              <div className="rank-info">
                <div className='container-rankwr'>
                  <p className="rank">{playerRank} {leaguePoints}</p>
                </div>
                <div className='container-wl'>
                  <p className="wins">{wins}W</p>
                  <p className="losses">{losses}L</p>
                  <p className="win-rate">({winRate}%)</p>
                </div>
              </div>
              <div className='match-history-cont'>
                {rankedSoloMatches.slice(0, 8).map((match, idx) => (
                  <div
                    key={idx}
                    className="match-history-item"
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      margin: '0 -3px',
                    }}
                  >
                    <img
                      src={getChampionIconUrl(match.champion)}
                      alt={match.champion}
                      className={match.win ? 'win' : 'lose'}
                    />
                  </div>
                ))}
              </div>
            </div>
  
            <div className='container-right'>
              <div className='decay-container'>
                <div>
                  <a className='decay-modal' onClick={() => openDecayModal(uniqueKey)}>
                    <h1 className='decay-count'>{selectedPlayer.decayDaysLeft || 0}</h1>
                  </a>
                  <h1 className='decay-count2'>days</h1>
                </div>
                <div className='decay-btn-container'>
                  <button className='decay-btn-refresh' onClick={() => handleDecayRefresh(uniqueKey)}>
                    <FontAwesomeIcon icon={faRotateRight} size="2x" color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };
  

  return (
    <div className="App">
      <div className='container-main'>
        <div className="container">
          <div className='search-app-container'>
            <input
              className='input-app'
              type="text"
              placeholder="Enter RiotID#Tagline"
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  searchForPlayer(e);
                }
              }}
            />
            <button className='search-btn' onClick={searchForPlayer}>DT.GG</button>
            <div className="dropdown-container">
              <button className="dropdown-btn" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faMoon} size="1x" color="white" />
              </button>
            </div>
          </div>
        </div>

        <div className='container-data'>
          <div className='filter-container'>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button className='btn-filter' onClick={handleSortRankHighToLow}>
              Rank ▲
            </button>
            <button className='btn-filter' onClick={handleSortRankLowToHigh}>
              Rank ▼
            </button>
            <button className='btn-filter-decay' onClick={handleSortDecayLowToHigh}>
              Decay ▼
            </button>
            <button className='btn-filter-decay' onClick={handleSortDecayHighToLow}>
              Decay ▲
            </button>
          </div>
          {renderPlayerData()}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={handleSaveCredentials}
          onReset={handleResetCredentials}
          onUpdatePlayerData={onUpdatePlayerData}
          onDeletePlayer={onDeletePlayer}
          existingCredentials={currentPlayerKey && playerData && playerData[currentPlayerKey]?.credentials}
          gameName={currentPlayerGameName}
          tagLine={currentPlayerTagLine}
          profileIconId={profileIconId}
          tier={currentTier}
          playerKey={currentPlayerKey}
          isFavorite={currentPlayerKey && playerData && playerData[currentPlayerKey]?.favorite} // Add this line
        />




        <DecayModal
          isOpen={decayModalOpen}
          onClose={() => setDecayModalOpen(false)}
          onSubmit={handleSaveDecayDays}
          currentDecayDays={decayDays}
        />
      </div>
    </div>
  );
}

export default App;
