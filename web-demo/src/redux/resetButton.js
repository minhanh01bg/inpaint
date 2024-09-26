import React from 'react';
import { persistor } from './store';

const ResetButton = () => {
  const handleReset = () => {
    persistor.purge();
    window.location.reload();
  };

  return <button className='btn btn-ouline btn-primary' onClick={handleReset}>Reset</button>;
};

export default ResetButton;
