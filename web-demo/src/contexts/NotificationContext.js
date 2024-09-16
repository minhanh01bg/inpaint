// src/contexts/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const showErrorNotification = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setLoginSuccess(false);
    // Hide the notification after 3 seconds
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const showSuccessNotification = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setLoginSuccess(true);
    // Hide the notification after 3 seconds
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const handleClose = () => {
		setShowError(false);
	};

  return (
    <NotificationContext.Provider value={{ showError, errorMessage, loginSuccess, showErrorNotification, showSuccessNotification, handleClose }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
