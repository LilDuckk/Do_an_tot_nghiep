import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
          <Button color="inherit" onClick={() => navigate('/')}>
            Trang chủ
          </Button>
          <Button color="inherit" onClick={() => navigate('/products')}>
            Sản phẩm
          </Button>
          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={() => navigate('/checkout')}>
                Giỏ hàng
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © 2024 Watch Store. Tất cả quyền được bảo lưu.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ClientLayout; 