// src/components/Notifications.js
import React, {useState, useEffect} from 'react';
import iconSuccess  from '../assets/img/icons8-tick-48.png';
import iconError from '../assets/img/icons8-error-48.png';
import { useNotification } from '../contexts/NotificationContext';

import { Button, Transition } from '@headlessui/react'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'

const Notifications = () => {
  const { showError, errorMessage, handleClose, loginSuccess } = useNotification();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showError) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [showError]);
  return (
    <>
      {showError && errorMessage && (
        <>
          <div className={`z-50 fixed top-5 right-5 flex items-center w-full max-w-xs p-4 bg-base-100 rounded-lg shadow
            ${loginSuccess ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'} transition-all duration-500 ease-in-out transform 
            ${visible ? 'translate-x-0' : 'translate-x-full'}`} role="alert"
          >
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 rounded-lg ${loginSuccess ? 'bg-green-100':'bg-red-100'}`}>
              {loginSuccess ? (
                <>
                  <img src={iconSuccess} alt="Checkmark icon" className="w-6 h-6" />
                  <span className="sr-only">Checkmark icon</span>
                </>
              ) : (
                <>
                  <img src={iconError} alt="Checkmark icon" className="w-6 h-6" />
                  <span className="sr-only">Checkmark icon</span>
                </>
              )}
              <span className="sr-only">Fire icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{errorMessage}</div>
            <button onClick={handleClose} type="button" className="ms-auto -mx-1.5 -my-1.5 bg-base-100 hover rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" data-dismiss-target="#toast-default" aria-label="Close">
              <span className="sr-only">Close</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Notifications;
