import React from 'react';
import { persistor } from './store';

const ResetButton = () => {
  const handleReset = () => {
    persistor.purge(); // Xóa localStorage
    window.location.reload(); // Reload trang để áp dụng thay đổi
  };

  return <button className='btn btn-ouline btn-primary' onClick={handleReset}>Reset</button>;
};

export default ResetButton;
