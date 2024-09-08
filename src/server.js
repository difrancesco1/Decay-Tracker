const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const moment = require('moment-timezone'); // For timezone handling
require('dotenv').config(); // Use dotenv for securely managing environment variables

const app = express();

// Rate limiter to prevent hitting the Riot API too frequently
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

const API_KEY = 'RGAPI-0a522d7f-d6dd-4e26-b154-74867b394c53';  // Use environment variable for the API key

// Function to get current day, hours, and minutes in PST using moment-timezone
const getCurrentTime = () => {
  const pstTime = moment().tz('America/Los_Angeles');
  return {
    day: pstTime.date().toString().padStart(2, '0'),
    hours: pstTime.hours().toString().padStart(2, '0'),
    minutes: pstTime.minutes().toString().padStart(2, '0'),
  };
};

// Log the current time in PST
const logCurrentTime = () => {
  const currentdate = getCurrentTime();
  console.log(`Last Sync: Day ${currentdate.day} at ${currentdate.hours}:${currentdate.minutes}`);
};
logCurrentTime();

// Utility to read data from file
const readDataFromFile = (callback) => {
  fs.readFile('playerData.json', (err, data) => {
    if (err) {
      console.log('Error reading file:', err);
      callback({});
    } else {
      try {
        const jsonData = JSON.parse(data);
        callback(jsonData);
      } catch (err) {
        console.log('Error parsing JSON data:', err);
        callback({});
      }
    }
  });
};

// Utility to write data to file
const writeDataToFile = (data, callback) => {
  fs.writeFile('playerData.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log('playerData.json updated successfully.');
      if (callback) callback();
    }
  });
};

// Route to fetch all players
app.get('/players', (req, res) => {
  readDataFromFile((data) => {
    res.json(data);
  });
});

// Route to search player by Riot ID and Tagline
app.get('/search/:riotID/:tagline', (req, res) => {
  const { riotID, tagline } = req.params;
  const searchTime = getCurrentTime();  // Now returns time in PST

  // URL-encode the RiotID and Tagline to handle non-ASCII characters
  const encodedRiotID = encodeURIComponent(riotID);
  const encodedTagline = encodeURIComponent(tagline);

  const apiUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedRiotID}/${encodedTagline}?api_key=${API_KEY}`;
  console.log(`Requesting data from API: ${apiUrl}`);

  axios.get(apiUrl)
    .then(response => {
      const playerData = response.data;
      const puuid = playerData.puuid;

      if (!puuid) {
        throw new Error('Puuid not found for player');
      }

      // Use puuid to get summoner data
      const summonerApiUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;

      return axios.get(summonerApiUrl).then(summonerResponse => {
        const summonerData = summonerResponse.data;
        const summonerId = summonerData.id;

        // Now use summonerId to get the league data
        const leagueApiUrl = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`;

        return axios.get(leagueApiUrl).then(leagueResponse => {
          const leagueData = leagueResponse.data;

          // Combine all data into a single object
          const combinedPlayerData = {
            ...playerData,
            summonerData,
            leagueData,
            lastSearchTime: searchTime, // Add last search time to player data
          };

          // Decouple match history fetching for better performance
          fetchMatchHistory(puuid, riotID, tagline, combinedPlayerData, res);
        });
      });
    })
    .catch(error => {
      // Log the full error response for better debugging
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
        res.status(500).send(`Error fetching player data: ${error.response.data.message || 'Unexpected error'}`);
      } else {
        console.error('Error fetching player data:', error.message);
        res.status(500).send('Error fetching player data');
      }
    });
});

// Function to fetch match history and update the player's data
const fetchMatchHistory = (puuid, riotID, tagline, combinedPlayerData, res) => {
  const matchHistoryApiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;

  // Fetch match history
  axios.get(matchHistoryApiUrl).then(matchHistoryResponse => {
    const matchIds = matchHistoryResponse.data;

    // Retrieve each match's details
    const matchDetailsPromises = matchIds.map(matchId => {
      const matchDetailApiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`;

      return axios.get(matchDetailApiUrl).then(matchDetailResponse => {
        const matchInfo = matchDetailResponse.data.info;
        const rankedSoloGame = matchInfo.queueId === 420; // Queue ID 420 = Ranked Solo

        if (rankedSoloGame) {
          const playerDataInMatch = matchInfo.participants.find(
            participant => participant.puuid === puuid
          );

          return {
            matchId,
            win: playerDataInMatch.win,
            champion: playerDataInMatch.championName,
          };
        }
        return null;
      });
    });

    // Once all match details are fetched, update the player data
    Promise.all(matchDetailsPromises).then(matches => {
      const rankedSoloMatches = matches.filter(match => match !== null);

      // Read player data and update with new match history and decay days
      readDataFromFile((data) => {
        const playerKey = `${riotID.toLowerCase()}-${tagline.toLowerCase()}`;
        const existingPlayer = data[playerKey];
        let updatedDecayDays = existingPlayer ? existingPlayer.decayDaysLeft : 0;

        // Increment decay days if new matches are found
        if (existingPlayer && rankedSoloMatches.length > existingPlayer.rankedSoloMatches.length) {
          updatedDecayDays = Math.min(updatedDecayDays + 1, 14); // Cap decay days at 14
        }

        combinedPlayerData.decayDaysLeft = updatedDecayDays;
        combinedPlayerData.rankedSoloMatches = rankedSoloMatches;

        // Add combined player data to playerData.json
        data[playerKey] = combinedPlayerData;

        writeDataToFile(data, () => {
          res.json(combinedPlayerData); // Respond to the client with the updated data
        });
      });
    });
  }).catch(error => {
    console.error('Error fetching match history:', error);
    res.status(500).send('Error fetching match history');
  });
};

// Route to update player credentials and decay time
app.post('/update-decay', (req, res) => {
  const { playerKey, decayDays, lastSearchTime } = req.body; // Also expect lastSearchTime from request

  readDataFromFile((fileData) => {
    if (!fileData[playerKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update decayDaysLeft and lastSearchTime
    fileData[playerKey].decayDaysLeft = decayDays;
    fileData[playerKey].lastSearchTime = lastSearchTime; // Update last search time

    // Write updated data to file
    writeDataToFile(fileData, () => {
      res.json({ message: 'Decay days and last search time updated successfully' });
    });
  });
});

// Route to update player credentials
app.post('/update', (req, res) => {
  const { playerKey, data } = req.body;

  if (!playerKey || !data) {
    return res.status(400).json({ error: 'Missing playerKey or data' });
  }

  // Read current player data from file
  readDataFromFile((fileData) => {
    if (!fileData[playerKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update the player credentials
    fileData[playerKey] = {
      ...fileData[playerKey],
      ...data,  // This includes credentials update
    };

    // Write the updated data back to the file
    writeDataToFile(fileData, () => {
      res.json({ message: 'Player credentials updated successfully' });
    });
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
