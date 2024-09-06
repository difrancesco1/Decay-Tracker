import React, { useState, useEffect } from 'react';
import './Modal.css'; // Import the modal CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk,faCircleXmark,faellipsis } from '@fortawesome/free-solid-svg-icons';

import masterBorder from './assets/ranked-emblem/wings/wings_master.png';



const Modal = ({ isOpen, onClose, onSubmit, onReset, existingCredentials, profileIconId, gameName, tagLine }) => {
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

  if (!isOpen) return null; // If modal is not open, return nothing

  const handleSave = () => {
    onSubmit({ username, password });
    onClose(); // Close modal after saving
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    onReset(); // Reset credentials
    onClose(); // Close modal after resetting
  };

  const profileIconUrl = profileIconId
    ? `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${profileIconId}.png`
    : null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <span className="" onClick={onClose}><FontAwesomeIcon icon="fa-circle-xmark" /></span>
        
        {/* Container to display both profile border and icon */}
        <div className="icon-container">
          <img className="border-image" src={masterBorder} alt="Master Border" />
          {profileIconUrl && (
            <img className="icon-modal" src={profileIconUrl} alt="Profile Icon" />
          )}
        </div>

        {/* Display gameName and tagLine at the top */}
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
            {existingCredentials ? <FontAwesomeIcon icon={faFloppyDisk} size="lg" /> : 'Save Credentials'}
          </button>
          
        </div>
        {/* <svg className='svg-wave' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#EABEC3" fill-opacity="1" d="M0,224L720,256L1440,32L1440,320L720,320L0,320Z"></path></svg> */}
        <svg className='svg-wave' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#EABEC3" fill-opacity="1" d="M0,256L120,256C240,256,480,256,720,229.3C960,203,1200,149,1320,122.7L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
      </div>
    </>
  );
};

export default Modal;
