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


Setup and Installation
Prerequisites:

    Node.js: Ensure you have Node.js installed on your machine.
    Riot API Key: Obtain an API key from the Riot Developer Portal.

Steps:

    Clone the repository:

    bash

git clone https://github.com/your-repo/ranked-decay-tracker.git
cd ranked-decay-tracker

Install dependencies:

bash

npm install

Set up environment variables:

    Create a .env file in the project root and add your Riot API key:

    makefile

    RIOT_API_KEY=your-riot-api-key

Start the server:

bash

npm run server

Start the front-end:

bash

npm run start

Open the app in your browser:

arduino

http://localhost:3000

How It Works
Player Search

    Users enter the player’s Riot ID and Tagline in the format RiotID#Tagline.
    The app sends a request to the backend, which communicates with the Riot Games API to fetch player data based on their Riot ID and tagline.
    The app retrieves player data such as:
        Ranked Solo Queue tier, rank, and LP.
        Match history with details about champions played, win/loss, etc.
        The app stores and displays this data for the user.

Decay Tracking

    When new ranked solo matches are added to the player’s match history, the app increments the decay days counter.
    The decay counter is capped at a maximum (14 days for most tiers, 28 days for Diamond and above).
    The app recalculates decay days based on the player's tier and recent activity.

App Components
Search Player Component

    This component allows users to search for players by entering their Riot ID and Tagline.
    On submission, it calls the backend to fetch data from the Riot API, updating the UI with player data or error messages.

Decay Modal

    A pop-up modal that allows users to view and manually adjust the decay days left for a player.
    The modal tracks and displays the number of days until decay, based on player tier and activity.

Player Profile Card

    Displays the player’s ranked data, including their tier, rank, LP, and a list of their recent ranked solo queue matches.
    The card updates dynamically when new data is fetched from the API.

Credential Management

    Users can add or view account credentials associated with a player profile. These credentials are securely stored and only accessible via the app.





