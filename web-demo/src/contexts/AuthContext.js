import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { checkToken, setToken, removeToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../redux/store';
import config from '../configs';

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
        if (config.check_server) {
          // Nếu check_server là true, bỏ qua kiểm tra token và đặt trực tiếp
          setIsAuthenticated(true);
          setIsAdmin(true);
          setLoading(false);
          isMounted.current = true;
        } else {
          // Nếu check_server là false, thực hiện kiểm tra token
          const [authenticated, admin] = await checkToken();
          setIsAuthenticated(authenticated);
          setIsAdmin(admin);
          setLoading(false);
          isMounted.current = true;
          if (!authenticated) {
            navigate('/');
          }
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
