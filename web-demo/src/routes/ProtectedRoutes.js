import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Users from '../pages/Users';
import Inpainting from '../pages/Inpainting';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading'
import Upscaler from '../pages/Upscaler'
import Inpainting_v2 from '../pages/Inpainting_v2';
const ProtectedRoutes = () => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path='background_removal' element={<Home />} />
      <Route path='inpainting_v2' element={<Inpainting_v2 />} />
      <Route path='inpainting' element={<Inpainting />} />
      <Route path="users" element={isAdmin ? <Users />:<Navigate to="/background_removal" />} />
      <Route path="upscaling" element={<Upscaler />}/>
    </Routes>
  );
};

export default ProtectedRoutes;


