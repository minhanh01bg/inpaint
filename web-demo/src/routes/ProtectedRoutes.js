import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Users from '../pages/Users';
import Inpainting from '../pages/Inpainting';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading'
const ProtectedRoutes = () => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path='home' element={<Home />} />
      <Route path='inpainting' element={<Inpainting />} />
      <Route path="users" element={isAdmin ? <Users />:<Navigate to="/home" />} />
    </Routes>
  );
};

export default ProtectedRoutes;