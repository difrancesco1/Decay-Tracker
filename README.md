#Table of Contents

    Features
    Technologies Used
    Setup and Installation
    How It Works
    App Components
    API Integration
    Handling Errors
    Future Enhancements

#Features

    Search for Players: Users can search for players by their Riot ID and Tagline (e.g., Player#1234).
    Ranked Data: Displays detailed ranked solo/duo queue data including tier, rank, LP (League Points), wins, and losses.
    Match History: Shows the latest ranked solo queue matches played by the player, displaying the champion played, win/loss status, and match history.
    Decay Tracker: Tracks and displays the decay timer for high-ranking accounts (e.g., Diamond and above). Decay days increment automatically when ranked solo matches are played.
    Credential Storage: Allows users to securely store and display their account credentials.
    Real-time Data Updates: Automatically fetches updated data for a player and recalculates the decay days based on recent matches.

#Technologies Used
Front-end:

    React: JavaScript framework for building the user interface.
    Axios: Used for making HTTP requests to the backend and Riot Games API.
    FontAwesome: Icons for user interface elements.
    CSS: Styling for the user interface.

Back-end:

    Express.js: Web server used to handle API requests.
    Node.js: JavaScript runtime environment.
    Axios: For making requests to the Riot Games API.
    fs (File System): To read and write player data to playerData.json.
    Riot Games API: Provides the data for ranked matches, player details, and match history.

# Getting Started with Decay Tracker React App

## Available Scripts

In the project directory, you can run the program by:

### `npm start` on Decay-Tracker
### `node server.js` on src 

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.





