// import logo from './logo.svg';
import './App.css';

import { Routes, Route, useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';
import Layout from './pages/Layout';

import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';
import ProtectedRoutes from './routes/ProtectedRoutes';
import config from './configs';
import { persistor } from './redux/store';
function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động điều hướng đến trang /background_removal khi ứng dụng khởi chạy
    if (config.check_server && window.location.pathname === '/'){
      persistor.purge();
      navigate('/background_removal');
    }
  }, [navigate]);
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/' element={<Layout />}>
        <Route path='*' element={
          <PrivateRoute>
            <ProtectedRoutes />
          </PrivateRoute>} 
        />
      </Route>
    </Routes>
  );
}

export default App;
