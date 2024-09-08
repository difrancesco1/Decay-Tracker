import React, { useState, useEffect } from 'react';

const DecayModal = ({ isOpen, onClose, onSubmit, currentDecayDays }) => {
  const [decayDays, setDecayDays] = useState(currentDecayDays || 0);

  useEffect(() => {
    setDecayDays(currentDecayDays || 0);  // Update decay days when modal is opened with new data
  }, [currentDecayDays]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSubmit(decayDays); // Pass the decay days back to the parent component
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Set Decay Days Left</h2>
        <input
          type="number"
          value={decayDays}
          onChange={(e) => setDecayDays(Number(e.target.value))}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default DecayModal;