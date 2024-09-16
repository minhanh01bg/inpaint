import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';

import './scss/style.css'
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Notifications from './components/Notifications';
// store
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import { Provider } from 'react-redux';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        
          <NotificationProvider>
              <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <App />
                </PersistGate>
              </Provider>
              <Notifications />
            {/* <SlideOverLeft /> */}
          </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  // </React.StrictMode>
);

reportWebVitals();
