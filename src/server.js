const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = 'RGAPI-4bda1a2e-c9d1-46f1-8d59-5b13487e49ef';  // Replace with a valid Riot API Key

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

        //match history API for W/L data
        // const leagueApiMatchId = `https://na1.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;

        //Use leagueApiWL (matchId's) to get summoners mh
        // const leagueApiWL = `https://na1.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`

        // Use the "leagyeApiMatchId" to retrieve the matchId's (20) then store only the result and champion 
        // Use "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json" to get the champion ICON and send to App.js :] ALong with W/L to conditionally style the W/L section 


        return axios.get(leagueApiUrl).then(leagueResponse => {
          const leagueData = leagueResponse.data;

          // Combine all data into a single object
          const combinedPlayerData = {
            ...playerData,
            summonerData,
            leagueData
          };

          // Add combined player data to playerData.json
          readDataFromFile((data) => {
            const playerKey = `${riotID.toLowerCase()}-${tagline.toLowerCase()}`;
            data[playerKey] = combinedPlayerData;

            writeDataToFile(data, () => {
              res.json(combinedPlayerData);
            });
          });
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

// Route to update player credentials
app.post('/update', (req, res) => {
  const { playerKey, data } = req.body;

  readDataFromFile((fileData) => {
    fileData[playerKey] = data;

    writeDataToFile(fileData, () => {
      res.json({ message: 'Player data updated successfully' });
    });
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
