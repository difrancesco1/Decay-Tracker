# Decay Tracker

Decay Tracker is a full-stack React application that helps users track multiple League of Legends accounts, manage credentials securely, monitor days until ranked decay, and view account statistics. The app leverages the Riot Games API for real-time data retrieval and visualization.

![DecayTracker3](https://github.com/user-attachments/assets/045174cb-e567-496c-b505-67d5760637a3)

## Features

- Account Management: Store and manage multiple account credentials with encryption and secure local storage.
- Ranked Decay Tracking: Monitor the number of days remaining until ranked decay for each account.
- Real-Time Statistics: Fetch and display detailed match history, rank, and performance data from Riot Games API.
- Responsive UI: A modern, user-friendly interface designed with React, Tailwind CSS, and responsive design principles.
- Error Handling: Robust error-handling mechanisms to ensure smooth data fetching and a seamless user experience.

## Technologies Used

### Frontend
- React.js
- JavaScript

### Backend
- Node.js
- RESTful APIs
- Axios

### Database
- MongoDB

### Other Tools
- Riot Games API for data integration

## Installation and Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or cloud)

### Steps
1. Clone the repository:
   `git clone https://github.com/difrancesco1/Decay-Tracker.git
      cd Decay-Tracker`
2. Install dependencies:
   `npm install`
3. Set up environment variables:
   - Create a .env file in the project root.
   - Add the following variables:
     `REACT_APP_API_KEY=<Your Riot Games API Key>
        NODE_ENV=development
        MONGO_URI=<Your MongoDB connection string>`
4. Start the application:
   `npm start`
   The app will run on http://localhost:3000.

## Usage
1. Login/Register: Create an account to start managing League of Legends accounts.
2. Add Accounts: Add and save multiple accounts with their credentials.
3. Track Decay: View the number of days until ranked decay for each account.
4. View Statistics: Access detailed match history and performance metrics.

## Contact 
For inquiries or support, contact:
Joshua DiFrancesco
- Github: difrancesco1
