const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const moment = require('moment-timezone');
require('dotenv').config();

const app = express();
const normalizeKey = (key) => key.replace(/\s+/g, '').toLowerCase();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Rate limiters
const secondRateLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 20,
  message: { error: 'Too many requests, please try again after a second.' },
});

const minuteRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100,
  message: { error: 'Too many requests, please try again after a few minutes.' },
});

// Apply rate limiters
app.use(secondRateLimiter);
app.use(minuteRateLimiter);

// API Key
const API_KEY = process.env.API_KEY || "RGAPI-e3c3b905-cf41-4c3c-ad16-e1edc22ca4ab";

// Get current time in PST
const getCurrentTime = () => {
  const pstTime = moment().tz('America/Los_Angeles');
  return {
    day: pstTime.date().toString().padStart(2, '0'),
    hours: pstTime.hours().toString().padStart(2, '0'),
    minutes: pstTime.minutes().toString().padStart(2, '0'),
  };
};

// Utility functions to read and write data from file
const readDataFromFile = (callback) => {
  fs.readFile('playerData.json', (err, data) => {
    if (err) return callback({});
    try {
      const jsonData = JSON.parse(data);
      callback(jsonData);
    } catch {
      callback({});
    }
  });
};

const writeDataToFile = (data, callback) => {
  fs.writeFile('playerData.json', JSON.stringify(data, null, 2), (err) => {
    if (!err) console.log('playerData.json updated successfully.');
    if (callback) callback(err);
  });
};

// Routes
app.get('/players', (req, res) => {
  readDataFromFile((data) => res.json(data));
});

app.post('/update-decay', (req, res) => {
  const { playerKey, decayDays, lastSearchTime } = req.body;
  const normalizedKey = normalizeKey(playerKey);

  readDataFromFile((fileData) => {
    if (!fileData[normalizedKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }
    fileData[normalizedKey].decayDaysLeft = decayDays;
    fileData[normalizedKey].lastSearchTime = lastSearchTime;

    writeDataToFile(fileData, (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data to file' });
      res.json({ message: 'Decay days and last search time updated successfully' });
    });
  });
});

app.post('/update', (req, res) => {
  const { playerKey, data } = req.body;
  const normalizedKey = normalizeKey(playerKey);

  if (!playerKey || !data) return res.status(400).json({ error: 'Missing playerKey or data' });

  readDataFromFile((fileData) => {
    if (!fileData[normalizedKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }
    fileData[normalizedKey] = { ...fileData[normalizedKey], ...data };
    
    writeDataToFile(fileData, () => {
      res.json({ message: 'Player credentials updated successfully' });
    });
  });
});

app.post('/update-favorite', (req, res) => {
  const { playerKey, favorite } = req.body;
  const normalizedKey = normalizeKey(playerKey);

  readDataFromFile((fileData) => {
    if (!fileData[normalizedKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }
    fileData[normalizedKey].favorite = favorite;

    writeDataToFile(fileData, (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data to file' });
      res.json({ message: 'Favorite status updated successfully' });
    });
  });
});

app.post('/delete-player', (req, res) => {
  const { playerKey } = req.body;
  const normalizedKey = normalizeKey(playerKey);

  readDataFromFile((fileData) => {
    if (!fileData[normalizedKey]) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Delete the player from the file data
    delete fileData[normalizedKey];

    // Write the updated data back to the file
    writeDataToFile(fileData, (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data to file' });
      res.json({ message: `Player with key ${playerKey} deleted successfully.` });
    });
  });
});

app.get('/search/:riotID/:tagline', (req, res) => {
  const { riotID, tagline } = req.params;
  const searchTime = getCurrentTime();

  const encodedRiotID = encodeURIComponent(riotID);
  const encodedTagline = encodeURIComponent(tagline);

  const apiUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedRiotID}/${encodedTagline}?api_key=${API_KEY}`;

  axios.get(apiUrl)
    .then(response => {
      const playerData = response.data;
      const puuid = playerData.puuid;

      if (!puuid) throw new Error('Puuid not found for player');

      const summonerApiUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;
      return axios.get(summonerApiUrl).then(summonerResponse => {
        const summonerData = summonerResponse.data;
        const leagueApiUrl = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${API_KEY}`;

        return axios.get(leagueApiUrl).then(leagueResponse => {
          const leagueData = leagueResponse.data;

          const combinedPlayerData = {
            ...playerData,
            summonerData,
            leagueData,
            lastSearchTime: searchTime,
          };

          fetchMatchHistory(puuid, riotID, tagline, combinedPlayerData, res);
        });
      });
    })
    .catch(error => {
      console.error("Error fetching account or summoner data:", error.message);
      res.status(500).json({ error: 'Error fetching player data' });
    });
});

const fetchMatchHistory = (puuid, riotID, tagline, combinedPlayerData, res) => {
  const matchHistoryApiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;

  axios.get(matchHistoryApiUrl).then(matchHistoryResponse => {
    const matchIds = matchHistoryResponse.data;
    const matchDetailsPromises = matchIds.map(matchId => {
      const matchDetailApiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`;

      return axios.get(matchDetailApiUrl).then(matchDetailResponse => {
        const matchInfo = matchDetailResponse.data.info;
        if (matchInfo && matchInfo.queueId === 420) {
          const playerDataInMatch = matchInfo.participants.find(
            participant => participant.puuid === puuid
          );

          if (playerDataInMatch) {
            return {
              matchId,
              win: playerDataInMatch.win,
              champion: playerDataInMatch.championName,
            };
          }
        }
        return null;
      }).catch(error => {
        console.error(`Error fetching match details for match ID ${matchId}:`, error.message);
        return null; // Return null for failed match details to prevent Promise.all rejection
      });
    });

    Promise.all(matchDetailsPromises).then(matches => {
      const rankedSoloMatches = matches.filter(match => match !== null);
      const playerKey = normalizeKey(`${riotID}-${tagline}`);
      
      readDataFromFile((data) => {
        const existingPlayer = data[playerKey];
        const newMatchesCount = rankedSoloMatches.length - (existingPlayer?.rankedSoloMatches?.length || 0);
        const updatedDecayDays = Math.min((existingPlayer?.decayDaysLeft || 0) + newMatchesCount, 14);

        // Preserve the favorite status if it exists
        combinedPlayerData.decayDaysLeft = updatedDecayDays;
        combinedPlayerData.rankedSoloMatches = rankedSoloMatches;
        combinedPlayerData.favorite = existingPlayer?.favorite || false; // Preserve favorite status

        data[playerKey] = combinedPlayerData;

        writeDataToFile(data, () => res.json(combinedPlayerData));
      });
    });
  }).catch(error => {
    console.error("Error fetching match history:", error.message);
    res.status(500).json({ error: 'Error fetching match history' });
  });
};

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
