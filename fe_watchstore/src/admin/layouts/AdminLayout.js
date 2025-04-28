import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, Toolbar, CircularProgress } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = () => {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra token khi component mount
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
    }
  }, [logout]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Nếu chưa đăng nhập và không ở trang login, chuyển hướng về trang login
  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  // Nếu đã đăng nhập và đang ở trang login, chuyển hướng về dashboard
  if (isAuthenticated && location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Nếu chưa đăng nhập và đang ở trang login, hiển thị trang login
  if (!isAuthenticated && location.pathname === '/admin/login') {
    return <Outlet />;
  }

  // Nếu đã đăng nhập và không ở trang login, hiển thị layout admin
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 