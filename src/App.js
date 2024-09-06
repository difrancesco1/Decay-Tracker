import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from './Modal'; // Import the modal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faFilter } from '@fortawesome/free-solid-svg-icons';

// Import rank images
import challengerImg from './assets/ranked-emblem/emblem-challenger.png';
import gmImg from './assets/ranked-emblem/emblem-grandmaster.png';
import mImg from './assets/ranked-emblem/emblem-master.png';
import diaImg from './assets/ranked-emblem/emblem-diamond.png';
import emeraldImg from './assets/ranked-emblem/emblem-platinum.png'; // Emerald/Platinum
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
  const [isSorted, setIsSorted] = useState(false);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [unsortedPlayers, setUnsortedPlayers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlayerKey, setCurrentPlayerKey] = useState(null);
  const [profileIconId, setProfileIconId] = useState(null);
  const [currentPlayerGameName, setCurrentPlayerGameName] = useState('');
  const [currentPlayerTagLine, setCurrentPlayerTagLine] = useState('');
  const [currentCredentials, setCurrentCredentials] = useState({ username: '', password: '' });
  const [currentTier, setCurrentTier] = useState('UNRANKED');


  useEffect(() => {
    // Fetch profile icons
    axios
      .get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/profileicon.json')
      .then((response) => {
        setProfileIcons(response.data.data);
      })
      .catch((error) => {
        console.log('Error fetching profile icon data:', error);
      });

    // Fetch champion data
    axios
      .get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json')
      .then((response) => {
        setChampionData(response.data.data);
      })
      .catch((error) => {
        console.log('Error fetching champion data:', error);
      });

    // Fetch player data
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

  const calculateWinRate = (wins, losses) => {
    if (wins + losses === 0) return 0;
    return ((wins / (wins + losses)) * 100).toFixed(2);
  };

  const sortByRankAndLeaguePoints = (data) => {
    const rankOrder = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON'];

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

        return b.soloQueueData.leaguePoints - a.soloQueueData.leaguePoints;
      });
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
    
    console.log("Selected Player Data: ", selectedPlayer);
  
    if (selectedPlayer && selectedPlayer.summonerData) {
      const soloQueueData = getSoloQueueData(selectedPlayer.leagueData);
      console.log("Solo Queue Data: ", soloQueueData);
  
      if (!soloQueueData) {
        console.error("No soloQueueData found for player.");
        return;
      }
  
      const tier = soloQueueData?.tier || 'UNRANKED';  // Fallback in case tier is undefined
      console.log("Tier before opening modal: ", tier);
  
      // Set the state and pass the tier directly as props
      setCurrentPlayerKey(normalizedKey);
      setProfileIconId(selectedPlayer.summonerData.profileIconId);
      setCurrentPlayerGameName(selectedPlayer.gameName);
      setCurrentPlayerTagLine(selectedPlayer.tagLine);
      
      // Set the modal tier explicitly into a separate state
      setModalOpen(true);
  
      // This ensures the tier is explicitly passed as a prop to the Modal
      console.log("Tier passed to Modal: ", tier);
      setCurrentTier(tier); // Add this line if you're missing a tier state
    } else {
      console.error('Player data or summonerData not found for key:', normalizedKey);
    }
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

  const handleSort = () => {
    const sorted = sortByRankAndLeaguePoints(playerData);
    setSortedPlayers(sorted);
    setIsSorted(true);
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

    axios
      .get(APICallString)
      .then(function (response) {
        const updatedPlayerData = {
          ...playerData,
          [`${riotID}-${tagline}`.toLowerCase()]: response.data,
        };
        setPlayerData(updatedPlayerData);

        const updatedUnsortedPlayers = Object.keys(updatedPlayerData).map((key) => updatedPlayerData[key]);
        setUnsortedPlayers(updatedUnsortedPlayers);

        if (isSorted) {
          const sorted = sortByRankAndLeaguePoints(updatedPlayerData);
          setSortedPlayers(sorted);
        } else {
          setSortedPlayers(updatedUnsortedPlayers);
        }
      })
      .catch(function (error) {
        setErrorMessage('Error fetching player data. Please check the Riot ID and Tagline.');
        console.log('Error fetching player data:', error.response ? error.response.data : error.message);
      });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${text} copied to clipboard`);
    }).catch(err => {
      console.log("could not copy text: ", err);
    });
  };

  const renderPlayerData = () => {
    if (!playerData) return null;

    return sortedPlayers.map((player, index) => {
      const { credentials, rankedSoloMatches } = player;
      const hasCredentials = credentials && credentials.username && credentials.password;
      const soloQueueData = getSoloQueueData(player.leagueData);

      const uniqueKey = `${player.gameName}-${player.tagLine}`;

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

      // Dynamically get the appropriate border based on the player's rank
      const rankBorder = getRankBorder(soloQueueData.tier);

      return (
        <div key={index} className="player-data">
          <button className="credentials-button" onClick={() => openModal(uniqueKey)}>
            <FontAwesomeIcon icon={faEllipsis} size="3x" color="white" />
          </button>
          <div className='data-cont'>
            <div className="player-profile">
              <div className="icon-container-app">
                {/* Dynamically set the border image based on the player's rank */}
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
                  {rankedSoloMatches && rankedSoloMatches.slice(0, 10).map((match, idx) => (
                    <div
                      key={idx}
                      className="match-history-item"
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        margin: '0 -5px',
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
                  <h1 className='decay-count'>6</h1>
                  <h1 className='decay-count2'>days</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };


  // Add the log to verify tier before the return statement
  console.log("Tier passed to Modal in App.js: ", playerData && playerData[currentPlayerKey]?.soloQueueData?.tier || 'UNRANKED');

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
            />
            <button className='search-btn' onClick={searchForPlayer}>DT.GG</button>
          </div>
        </div>

        <div className='container-data'>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <button className='btn-filter' onClick={handleSort}>Filter
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
  tier={currentTier}  // Pass the stored tier
/>


      </div>
    </div>
  );
}

export default App;