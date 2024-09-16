// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { checkToken, getToken, setToken, removeToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../redux/store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    const verifyToken = async () => {
      if (!isMounted.current) {
        const [isAuthenticated, isAdmin] = await checkToken();
        console.log('isAuthenticated: ', isAuthenticated, isAdmin);
        setIsAuthenticated(isAuthenticated);
        setIsAdmin(isAdmin);
        setLoading(false);
        isMounted.current = true;
        if (!isAuthenticated) {
          navigate('/');         
        }
      }
    };
    verifyToken();
  }, [navigate]);

  const login = (token) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    persistor.purge();
    // removeToken();
    setIsAuthenticated(false);
    navigate('/');  
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
