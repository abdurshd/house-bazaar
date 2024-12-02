import React from 'react';
import './Spinner.css';

const Spinner = ({ error }) => {
  return (
    <div className="loadingSpinnerContainer">
      <div className="loadingSpinner"></div>
      {error && <p className="loadingError">{error}</p>}
    </div>
  );
};

export default Spinner; 