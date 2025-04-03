import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Category as CategoryIcon,
  ShoppingCart as ProductIcon,
  People as UserIcon,
  Receipt as OrderIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    // Chỉ chuyển hướng khi không phải đang loading và user không phải admin
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Không hiển thị gì nếu chưa xác thực hoặc không phải admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Sản phẩm', icon: <ProductIcon />, path: '/admin/products' },
    { text: 'Danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Người dùng', icon: <UserIcon />, path: '/admin/users' },
    { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 