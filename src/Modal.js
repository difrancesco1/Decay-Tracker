import React, { useState, useEffect } from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

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

// Function to get the correct rank border
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
      return masterBorder; // Default to masterBorder if no rank is found
  }
};

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  onReset,
  onUpdatePlayerData,
  onDeletePlayer,
  existingCredentials,
  profileIconId,
  gameName,
  tagLine,
  tier,
  playerKey,
  isFavorite, // Receive the favorite status
}) => {
  // Log the tier received in Modal.js
  console.log("Tier received in Modal.js: ", tier);
  console.log("Profile Icon ID received in Modal.js: ", profileIconId);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteStatus, setFavoriteStatus] = useState(isFavorite); // Local state for favorite status

  useEffect(() => {
    if (existingCredentials) {
      setUsername(existingCredentials.username);
      setPassword(existingCredentials.password);
    } else {
      setUsername('');
      setPassword('');
    }
  }, [existingCredentials]);

  useEffect(() => {
    setFavoriteStatus(isFavorite); // Update local state when isFavorite prop changes
  }, [isFavorite]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSubmit({ username, password });
    onClose();
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    onReset();
    onClose();
  };

  const handleFavorite = () => {
    if (typeof playerKey !== 'string') {
      console.error("Expected playerKey to be a string but got:", playerKey);
      return;
    }

    const normalizedKey = playerKey.replace(/\s+/g, '').toLowerCase();

    onUpdatePlayerData((prevData) => {
      const isFavorite = prevData[normalizedKey]?.favorite || false;
      const updatedData = {
        ...prevData,
        [normalizedKey]: {
          ...prevData[normalizedKey],
          favorite: !isFavorite,
        },
      };

      // Update the server with the new favorite status
      axios
        .post('http://localhost:3001/update-favorite', {
          playerKey: normalizedKey,
          favorite: !isFavorite,
        })
        .then(() => {
          console.log("Favorite status updated on the server");
          setFavoriteStatus(!isFavorite); // Update local state to reflect new status
        })
        .catch((error) => {
          console.error("Error updating favorite status on server:", error);
        });

      return updatedData;
    });
  };

  const handleDelete = () => {
    const playerKey = `${gameName}-${tagLine}`.toLowerCase().replace(/\s+/g, '');
  
    axios
      .post('http://localhost:3001/delete-player', { playerKey }) // Use correct endpoint here
      .then(() => {
        console.log(`Player ${gameName}-${tagLine} deleted successfully.`);
        onDeletePlayer(playerKey); // Update UI
        onClose(); // Close modal
      })
      .catch((error) => {
        console.error("Error deleting player data:", error);
      });
  };
  
  

  const profileIconUrl = profileIconId
    ? `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${profileIconId}.png`
    : null;

  // Debugging logs to verify tier and profileIconId are being passed correctly
  console.log("Tier in Modal: ", tier);  // This should log the tier such as 'GRANDMASTER'
  console.log("Profile Icon ID in Modal: ", profileIconId);

  const rankBorder = getRankBorder(tier);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <span className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </span>

        {/* Display rank border and profile icon */}
        <div className="icon-container">
          <img className="border-image" src={rankBorder} alt={`${tier} Border`} />
          {profileIconUrl && (
            <img className="icon-modal" src={profileIconUrl} alt="Profile Icon" />
          )}
        </div>

        {/* Display gameName and tagLine */}
        <h2 className="ign-modal">{gameName}#{tagLine}</h2>

        <form className="form-modal">
          <label className="label-modal">
            <input
              className="input-modal"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <br />
          <label className="label-modal">
            <input
              className="input-modal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </form>

        <div className="buttons-modal">
          <button className="button-modal" onClick={handleSave}>
            <FontAwesomeIcon icon={faFloppyDisk} size="lg" />
          </button>

          {/* Favorite/Unfavorite Button */}
          <button
            className="button-modal favorite-button"
            onClick={handleFavorite}
          >
            {favoriteStatus ? 'Unfavorite' : 'Favorite'}
          </button>

          {/* Delete Button */}
          <button className="button-modal delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default Modal;
