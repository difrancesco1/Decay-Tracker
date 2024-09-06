import React, { useState, useEffect } from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

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

const Modal = ({ isOpen, onClose, onSubmit, onReset, existingCredentials, profileIconId, gameName, tagLine, tier }) => {

  // Log the tier received in Modal.js
  console.log("Tier received in Modal.js: ", tier);
  console.log("Profile Icon ID received in Modal.js: ", profileIconId);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (existingCredentials) {
      setUsername(existingCredentials.username);
      setPassword(existingCredentials.password);
    } else {
      setUsername('');
      setPassword('');
    }
  }, [existingCredentials]);

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

  // Debugging logs to verify tier and profileIconId are being passed correctly
  console.log("Tier in Modal: ", tier);  // This should log the tier such as 'GRANDMASTER'
  console.log("Profile Icon ID in Modal: ", profileIconId);

  const profileIconUrl = profileIconId
    ? `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${profileIconId}.png`
    : null;


  // Check tier is passed correctly into Modal
  console.log("Tier received in Modal.js: ", tier);
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
        </div>

        <svg className='svg-wave' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#EABEC3" fillOpacity="1" d="M0,256L120,256C240,256,480,256,720,229.3C960,203,1200,149,1320,122.7L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
        </svg>
      </div>
    </>
  );
};

export default Modal;
