import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';

const ClientLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Watch Store
          </Typography>
          <Button color="inherit" onClick={() => navigate('/cart')}>
            Giỏ hàng
          </Button>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Đăng xuất
            </Button>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            © 2024 Watch Store. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ClientLayout; 