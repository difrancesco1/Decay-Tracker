import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from './Modal';
import DecayModal from './DecayModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faFilter, faRotateRight } from '@fortawesome/free-solid-svg-icons';

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

  // Copy to Clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${text} copied to clipboard`);
    }).catch(err => {
      console.log("Could not copy text: ", err);
    });
  };

  useEffect(() => {
    axios
      .get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/profileicon.json')
      .then((response) => {
        setProfileIcons(response.data.data);
      })
      .catch((error) => {
        console.log('Error fetching profile icon data:', error);
      });

    axios
      .get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json')
      .then((response) => {
        setChampionData(response.data.data);
      })
      .catch((error) => {
        console.log('Error fetching champion data:', error);
      });

    axios
      .get('http://localhost:3001/players')
      .then((response) => {
        const data = response.data;
        setPlayerData(data);
        const unsorted = Object.keys(data).map((key) => data[key]);
        setUnsortedPlayers(unsorted);
        setSortedPlayers(unsorted);
      })
      .catch((error) => {
        console.log('Error fetching cached player data:', error);
        setErrorMessage('Error fetching cached player data');
      });
  }, []);

  const getSoloQueueData = (leagueData) => {
    if (leagueData) {
      return leagueData.find((queue) => queue.queueType === 'RANKED_SOLO_5x5');
    }
    return null;
  };

  const getProfileIconUrl = (profileIconId) => {
    const version = '14.17.1';
    if (profileIconId) {
      return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
    }
    return 'path/to/default-icon.png';
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
        return masterBorder; // Default to Master if no rank found
    }
  };


  const getCurrentTime = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0'); // Day of the month (01-31)
    const hours = date.getHours().toString().padStart(2, '0'); // Hours in 24-hour format (00-23)
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes (00-59)
  
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
    const champion = Object.values(championData).find((champ) => champ.id === championName);
    if (champion) {
      return `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/champion/${champion.image.full}`;
    }
    return null;
  };

  const openModal = (playerKey) => {
    const normalizedKey = playerKey.toLowerCase();
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
    const normalizedKey = playerKey.toLowerCase();
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

    axios
      .post('http://localhost:3001/update', {
        playerKey: currentPlayerKey,
        data: updatedPlayerData[currentPlayerKey],
      })
      .then(() => {
        console.log('Credentials saved successfully!');
      })
      .catch((error) => {
        console.log('Error updating player data:', error);
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
    forceRender((prev) => prev + 1);

    axios
      .post('http://localhost:3001/update-decay', { playerKey: currentPlayerKey, decayDays: days })
      .then(() => {
        console.log('Decay days saved successfully!');
      })
      .catch((error) => {
        console.log('Error saving decay days:', error);
      });

    setDecayModalOpen(false);
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
        console.log('Credentials reset successfully!');
      })
      .catch((error) => {
        console.log('Error resetting credentials:', error);
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

  const searchForPlayer = (event) => {
    event.preventDefault();
  
    const [riotID, tagline] = searchText.split('#');
    if (!riotID || !tagline) {
      setErrorMessage('Please enter both RiotID and Tagline in the format: RiotID#Tagline');
      return;
    }

    setErrorMessage('');
  
    const APICallString = `http://localhost:3001/search/${riotID}/${tagline}`;
    const currentTime = getCurrentTime();  // Get current time for lastSearchTime
    
    axios
      .get(APICallString)
      .then(function (response) {
        const normalizedKey = `${riotID}-${tagline}`.toLowerCase();
        let existingDecayDays = 0;
        let existingLastSearchTime = currentTime;  // Initialize with current time
  
        if (playerData && playerData[normalizedKey]) {
          existingDecayDays = playerData[normalizedKey].decayDaysLeft || 0;
          existingLastSearchTime = playerData[normalizedKey].lastSearchTime || currentTime;
        }

        const updatedPlayerData = {
          ...playerData,
          [normalizedKey]: {
            ...response.data,
            decayDaysLeft: existingDecayDays,
            lastSearchTime: currentTime,  // Update the last search time to the current time
          },
        };

        setPlayerData(updatedPlayerData);
        const updatedUnsortedPlayers = Object.keys(updatedPlayerData).map((key) => updatedPlayerData[key]);

        const searchedPlayer = updatedUnsortedPlayers.find(
          (player) => `${player.gameName}-${player.tagLine}`.toLowerCase() === normalizedKey
        );

        const otherPlayers = updatedUnsortedPlayers.filter(
          (player) => `${player.gameName}-${player.tagLine}`.toLowerCase() !== normalizedKey
        );

        if (searchedPlayer) {
          setSortedPlayers([searchedPlayer, ...otherPlayers]);
        } else {
          setSortedPlayers(otherPlayers);
        }

        forceRender((prev) => prev + 1);
      })
      .catch(function (error) {
        setErrorMessage('Error fetching player data. Please check the Riot ID and Tagline.');
        console.log('Error fetching player data:', error.response ? error.response.data : error.message);
      });
  };


  const handleDecayRefresh = (playerKey) => {
    const normalizedKey = playerKey.toLowerCase();
  
    if (!playerData) {
      console.error("Player data is not loaded.");
      return;
    }
  
    const player = playerData[normalizedKey];
    if (!player) {
      console.error(`Player not found for key ${normalizedKey}`);
      return;
    }
  
    if (!player.lastSearchTime) {
      player.lastSearchTime = getCurrentTime(); // Initialize if not set
    }
  
    const currentTime = getCurrentTime();
    const lastSearchTime = player.lastSearchTime;
  
    // The decay refresh happens at 11:44 PM PST
    const refreshHour = 23;
    const refreshMinute = 44;
  
    // Create a Date object for the last search time
    const lastSearchDate = new Date();
    lastSearchDate.setDate(lastSearchTime.day);
    lastSearchDate.setHours(lastSearchTime.hours);
    lastSearchDate.setMinutes(lastSearchTime.minutes);
  
    // Create a Date object for the current time
    const currentDate = new Date();
    currentDate.setDate(currentTime.day);
    currentDate.setHours(currentTime.hours);
    currentDate.setMinutes(currentTime.minutes);
  
    // Get the next 11:44 PM after the last search date
    const nextRefreshDate = new Date(lastSearchDate);
    nextRefreshDate.setHours(refreshHour, refreshMinute, 0, 0);
  
    if (lastSearchDate.getTime() > nextRefreshDate.getTime()) {
      // Move to the next day if last search was after 11:44 PM
      nextRefreshDate.setDate(nextRefreshDate.getDate() + 1);
    }
  
    // Calculate the number of full decay refreshes (11:44 PMs) that have passed
    let decayDaysPassed = 0;
    while (nextRefreshDate.getTime() <= currentDate.getTime()) {
      decayDaysPassed += 1;
      nextRefreshDate.setDate(nextRefreshDate.getDate() + 1); // Move to next 11:44 PM
    }
  
    // Maximum decay days based on the player's tier
    const maxDecayDays = player.summonerData.tier === "DIAMOND" ? 28 : 14;
  
    // Update the decay days based on how many full refreshes have passed
    let updatedDecayDays = Math.max(0, player.decayDaysLeft - decayDaysPassed);

    // Fetch updated ranked solo match data
    const APICallString = `http://localhost:3001/search/${player.gameName}/${player.tagLine}`;
  
    axios
      .get(APICallString)
      .then(function (response) {
        const updatedPlayerData = {
          ...playerData,
          [normalizedKey]: {
            ...player,
            decayDaysLeft: updatedDecayDays,
            lastSearchTime: currentTime, // Update last search time to the current time
            rankedSoloMatches: response.data.rankedSoloMatches || player.rankedSoloMatches // Update rankedSoloMatches
          },
        };

        setPlayerData(updatedPlayerData);
        forceRender((prev) => prev + 1);

        // Send the updated data to the server
        axios
          .post('http://localhost:3001/update-decay', { playerKey, decayDays: updatedDecayDays, lastSearchTime: currentTime })
          .then(() => {
            console.log('Decay days, lastSearchTime, and rankedSoloMatches updated successfully!');
          })
          .catch((error) => {
            console.error('Error updating decay data:', error);
          });
      })
      .catch(function (error) {
        console.error('Error fetching updated player data for ranked solo matches:', error);
      });
  };

  
  

  const renderPlayerData = () => {
    if (!playerData) return null;

    return sortedPlayers.map((player, index) => {
      const { credentials, rankedSoloMatches } = player;
      const hasCredentials = credentials && credentials.username && credentials.password;
      const soloQueueData = getSoloQueueData(player.leagueData);

      const uniqueKey = `${player.gameName.toLowerCase()}-${player.tagLine.toLowerCase()}`;

      if (!player.summonerData) {
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

      const profileIconUrl = getProfileIconUrl(player.summonerData?.profileIconId);
      const winRate = calculateWinRate(soloQueueData.wins, soloQueueData.losses);
      const playerRank = `${soloQueueData.tier} ${soloQueueData.rank}`;
      const leaguePoints = soloQueueData.leaguePoints;
      const wins = soloQueueData.wins;
      const losses = soloQueueData.losses;

      const rankBorder = getRankBorder(soloQueueData.tier);

      return (
        <div key={index} className="player-data">
          <button className="credentials-button" onClick={() => openModal(uniqueKey)}>
            <FontAwesomeIcon icon={faEllipsis} size="3x" color="white" />
          </button>
          <div className='data-cont'>
            <div className="player-profile">
              <div className="icon-container-app">
                <img className="border-image-app" src={rankBorder} alt={`${soloQueueData.tier} Border`} />
                {profileIconUrl && (
                  <img className="icon-modal-app" src={profileIconUrl} alt="Profile Icon" />
                )}
              </div>
              <div className='user-pass-copy'>
                <span className='user-copy'>
                  <a className='user-copy' onClick={() => copyToClipboard(credentials?.username || 'No username')}>[user]</a>
                </span>
                <span className='user-copy'>
                  <a className='user-copy' onClick={() => copyToClipboard(credentials?.password || 'No password')}>[pass]</a>
                </span>
              </div>
            </div>

            <div className='container-player-info'>
              <h3 className="game-name">{player.gameName}#{player.tagLine}</h3>

              <div className="rank-info">
                <div className='container-rankwr'>
                  <p className="rank">{playerRank} {leaguePoints}LP</p>
                </div>
                <div className='container-wl'>
                  <p className="wins">{wins}W</p>
                  <p className="losses">{losses}L</p>
                  <p className="win-rate">({winRate}%)</p>
                </div>
              </div>

              <div className='match-history-cont'>
                  {rankedSoloMatches && rankedSoloMatches.slice(0, 8).map((match, idx) => (
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
                  <h1 className='decay-count'>{player.decayDaysLeft || 0}</h1>
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
          </div>
        </div>

        <div className='container-data'>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          
          <button className='btn-filter' onClick={handleSortRankHighToLow}>
            Sort Rank: High to Low
            <FontAwesomeIcon icon={faFilter} size="lg" color="#181a1b" />
          </button>

          <button className='btn-filter' onClick={handleSortRankLowToHigh}>
            Sort Rank: Low to High
            <FontAwesomeIcon icon={faFilter} size="lg" color="#181a1b" />
          </button>

          <button className='btn-filter-decay' onClick={handleSortDecayLowToHigh}>
            Sort Decay: Low to High
            <FontAwesomeIcon icon={faFilter} size="lg" color="#181a1b" />
          </button>

          <button className='btn-filter-decay' onClick={handleSortDecayHighToLow}>
            Sort Decay: High to Low
            <FontAwesomeIcon icon={faFilter} size="lg" color="#181a1b" />
          </button>
          {renderPlayerData()}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={handleSaveCredentials}
          onReset={handleResetCredentials}
          existingCredentials={currentPlayerKey && playerData && playerData[currentPlayerKey]?.credentials}
          gameName={currentPlayerGameName}
          tagLine={currentPlayerTagLine}
          profileIconId={profileIconId}
          tier={currentTier}
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
