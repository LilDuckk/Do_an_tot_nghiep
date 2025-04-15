import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  
  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Nếu đã đăng nhập, render các route con
  return <Outlet />;
};

export default PrivateRoute; 