import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from './Modal'; // Import the modal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis,faFilter } from '@fortawesome/free-solid-svg-icons';



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
import masterBorder from './assets/ranked-emblem/wings/wings_master.png';


function App() {
  const [searchText, setSearchText] = useState(""); 
  const [playerData, setPlayerData] = useState(null); 
  const [profileIcons, setProfileIcons] = useState({}); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isSorted, setIsSorted] = useState(false); 
  const [sortedPlayers, setSortedPlayers] = useState([]); 
  const [unsortedPlayers, setUnsortedPlayers] = useState([]); 
  const [modalOpen, setModalOpen] = useState(false); 
  const [currentPlayerKey, setCurrentPlayerKey] = useState(null); // Use playerKey to fetch player data
  const [profileIconId, setProfileIconId] = useState(null); // Store profileIconId for modal
  const [currentPlayerGameName, setCurrentPlayerGameName] = useState(''); // Store game name for modal
  const [currentPlayerTagLine, setCurrentPlayerTagLine] = useState(''); // Store tag line for modal

  useEffect(() => {
    // Fetch profile icons and player data
    axios.get('https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/profileicon.json')
      .then(response => {
        setProfileIcons(response.data.data); 
      })
      .catch(error => {
        console.log('Error fetching profile icon data:', error);
      });

    axios.get('http://localhost:3001/players')
      .then(response => {
        const data = response.data;
        console.log('Fetched player data from server:', data); 
        setPlayerData(data); 
        const unsorted = Object.keys(data).map(key => data[key]);
        setUnsortedPlayers(unsorted); 
        setSortedPlayers(unsorted); 
      })
      .catch(error => {
        console.log('Error fetching cached player data:', error);
        setErrorMessage('Error fetching cached player data');
      });
  }, []); 

  const getSoloQueueData = (leagueData) => {
    if (leagueData) {
      return leagueData.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
    }
    return null;
  };

  const getProfileIconUrl = (profileIconId) => {
    console.log("Profile Icon ID:", profileIconId);  // Log the ID to check validity
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

  const calculateWinRate = (wins, losses) => {
    if (wins + losses === 0) return 0;
    return ((wins / (wins + losses)) * 100).toFixed(2);
  };

  const sortByRankAndLeaguePoints = (data) => {
    const rankOrder = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON'];

    return Object.keys(data)
      .map(key => {
        const player = data[key];
        const soloQueueData = getSoloQueueData(player.leagueData);
        return { ...player, soloQueueData };
      })
      .filter(player => player.soloQueueData)
      .sort((a, b) => {
        const rankA = rankOrder.indexOf(a.soloQueueData.tier);
        const rankB = rankOrder.indexOf(b.soloQueueData.tier);

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        return b.soloQueueData.leaguePoints - a.soloQueueData.leaguePoints;
      });
  };

  const openModal = (playerKey) => {
    // Normalize the playerKey by converting to lowercase
    const normalizedKey = playerKey.toLowerCase(); // Ensure key format matches playerData
  
    const selectedPlayer = playerData[normalizedKey]; 
    if (selectedPlayer && selectedPlayer.summonerData) {
      console.log("Selected Player's Profile Icon ID: ", selectedPlayer.summonerData.profileIconId); 
      setCurrentPlayerKey(normalizedKey); // Use the normalized key
      setProfileIconId(selectedPlayer.summonerData.profileIconId); // Set profileIconId for modal
      setCurrentPlayerGameName(selectedPlayer.gameName); // Set gameName for modal
      setCurrentPlayerTagLine(selectedPlayer.tagLine); // Set tagLine for modal
      setModalOpen(true); // Open the modal
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
          password: credentials.password
        }
      }
    };

    setPlayerData(updatedPlayerData); 

    axios.post('http://localhost:3001/update', { playerKey: currentPlayerKey, data: updatedPlayerData[currentPlayerKey] })
      .then(() => {
        console.log('Credentials saved successfully!');
      })
      .catch(error => {
        console.log('Error updating player data:', error);
      });

    closeModal(); 
  };

  const handleResetCredentials = () => {
    const updatedPlayerData = {
      ...playerData,
      [currentPlayerKey]: {
        ...playerData[currentPlayerKey],
        credentials: null
      }
    };

    setPlayerData(updatedPlayerData);

    axios.post('http://localhost:3001/reset-credentials', { playerKey: currentPlayerKey })
      .then(() => {
        console.log('Credentials reset successfully!');
      })
      .catch(error => {
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

    axios.get(APICallString)
      .then(function(response) {
        const updatedPlayerData = {
          ...playerData,
          [`${riotID}-${tagline}`.toLowerCase()]: response.data
        };
        setPlayerData(updatedPlayerData); 

        const updatedUnsortedPlayers = Object.keys(updatedPlayerData).map(key => updatedPlayerData[key]);
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

  const renderPlayerData = () => {
    if (!playerData) return null;
  
    return sortedPlayers.map((player, index) => {
      const { credentials } = player;
      const hasCredentials = credentials && credentials.username && credentials.password;
      const soloQueueData = getSoloQueueData(player.leagueData);
  
      const uniqueKey = `${player.gameName}-${player.tagLine}`;
  
      // Safeguard against undefined data
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
      const summonerLevel = player.summonerData.summonerLevel;
      const playerRank = `${soloQueueData.tier} ${soloQueueData.rank}`;
      const leaguePoints = soloQueueData.leaguePoints;
      const wins = soloQueueData.wins;
      const losses = soloQueueData.losses;
      const hotStreak = soloQueueData.hotStreak ? 'Yes' : 'No';
  
      return (
        <div key={index} className="player-data">
          <button className="credentials-button" onClick={() => openModal(uniqueKey)}>
              {hasCredentials ? <FontAwesomeIcon icon={faEllipsis}  size="3x" color="white" opacity=".6"/> : <FontAwesomeIcon icon={faEllipsis}  size="4x" color="white" />}
            </button>
          <div className='data-cont'>
          <div className="player-profile">
            {/* Profile Icon
            {profileIconUrl && (
              <img 
                className="profile-icon" 
                src={profileIconUrl} 
                alt="Profile Icon" 
                style={{ width: '80px', height: '80px' }} 
              />
            )} */}
            <div className="icon-container-app">
          <img className="border-image-app" src={masterBorder} alt="Master Border" />
          {profileIconUrl && (
            <img className="icon-modal-app" src={profileIconUrl} alt="Profile Icon" />
          )}
        </div>
        <div className='user-pass-copy'>
          <span className='user-copy'>
            <a className='user-copy'>[user]</a>
          </span>
          <span className='pass-copy'>
          <a className='pass-copy'>[pass]</a>
          </span>
        </div>
            
          </div>

          
          {/* Game Name and Tag Line */}
          <div className='container-player-info'>
          <h3 className="game-name">{player.gameName}#{player.tagLine}</h3>
  
          <div className="rank-info">
            {/* Summoner Level */}
            {/* <p className="summoner-level">Level: {summonerLevel}</p> */}
            
            {/* Rank Icon and Rank Info */}
            {/* <img 
              className="rank-emblem" 
              src={getRankImage(soloQueueData.tier)} 
              alt={`${soloQueueData.tier} emblem`} 
              style={{ width: '100px', height: '100px' }}
            /> */}
            <div className='container-rankwr'>
            <p className="rank">{playerRank} {leaguePoints}LP</p>
            {/* <p className="lp">LP: {leaguePoints}</p> */}
            
            </div>
            <div className='container-wl'>
              <p className="wins">{wins}W</p>
              <p className="losses">{losses}L</p>
              <p className="win-rate">({winRate}%)</p>
            </div>
            </div>

            <div className='match-history-cont'>
              <div className=''>

              </div>
            </div>
            </div>
            {/* <p className="hot-streak">Hot Streak: {hotStreak}</p> */}
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
  

  return (
    <div className="App">
      <div className='container-main'>
      <div className="container">
      {/* <h1 className='title-app'>Decay Tracker</h1> */}
        
        <div className='search-app-container'>
        
        <input className='input-app' 
          type="text" 
          placeholder="Enter RiotID#Tagline" 
          onChange={e => setSearchText(e.target.value)} 
        />
        <button className='search-btn' onClick={searchForPlayer}>DT.GG</button>
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#0099ff" fill-opacity="1" d="M0,32L60,74.7C120,117,240,203,360,224C480,245,600,203,720,186.7C840,171,960,181,1080,197.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg> */}
        </div>
      </div>
      <div className='container-data'>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Sort button */}
      <button onClick={handleSort} style={{ marginBottom: '20px' }}>
      <FontAwesomeIcon icon={faFilter}  size="4x" color="white" />
      </button>

      {renderPlayerData()}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSaveCredentials}
        onReset={handleResetCredentials}
        existingCredentials={currentPlayerKey && playerData[currentPlayerKey]?.credentials}
        gameName={currentPlayerGameName}    // Pass the game name
        tagLine={currentPlayerTagLine}      // Pass the tag line
        profileIconId={profileIconId}  // Pass profileIconId to the modal
      />
    </div>
    </div>
  );
}

export default App;
