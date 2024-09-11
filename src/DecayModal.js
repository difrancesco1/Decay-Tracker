import React, { useState, useEffect } from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const DecayModal = ({ isOpen, onClose, onSubmit, currentDecayDays }) => {
  const [decayDays, setDecayDays] = useState(currentDecayDays || 0);

  useEffect(() => {
    setDecayDays(currentDecayDays || 0);  // Update decay days when modal is opened with new data
  }, [currentDecayDays]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSubmit(decayDays); // Pass the decay days back to the parent component
    // Do NOT close the modal here; let the parent close it.
  };

  const handleOverlayClick = (e) => {
    if (e.target.className == 'modal-overlay') {
      onClose(); //closes the modal when clicking on the overlay (outside the modal)
    }
  };

  return (
    
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="d-modal">
        <h2 className='decay-title'>Set Decay Days Left</h2>
        <input className='decay-input'
          // type="number"
          value={decayDays}
          onChange={(e) => setDecayDays(Number(e.target.value))}
        />
        {/* <button onClick={handleSave}>Save</button> */}
        {/* <button onClick={onClose}>Cancel</button> */}
        
        <div className="buttons-modal">
          <button className="button-modal" onClick={handleSave}>
            <FontAwesomeIcon icon={faFloppyDisk} size="lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecayModal;
