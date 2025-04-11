import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  People as UserIcon,
  LocalOffer as CouponIcon,
  TrendingUp as RevenueIcon,
  Logout as LogoutIcon,
  Star as ReviewIcon,
  Article as NewsIcon,
  Settings as SettingsIcon,
  Assessment as ReportIcon,
  ExpandLess,
  ExpandMore,
  Campaign as CampaignIcon,
  Payment as PaymentIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Tổng quan', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Sản phẩm', icon: <ProductIcon />, path: '/admin/products' },
  { text: 'Danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
  { text: 'Người dùng', icon: <UserIcon />, path: '/admin/users' },
];

const reportItems = [
  { text: 'Báo cáo doanh thu', icon: <RevenueIcon />, path: '/admin/reports/revenue' },
  { text: 'Báo cáo sản phẩm', icon: <ProductIcon />, path: '/admin/reports/products' },
  { text: 'Báo cáo đơn hàng', icon: <OrderIcon />, path: '/admin/reports/orders' },
  { text: 'Báo cáo khách hàng', icon: <UserIcon />, path: '/admin/reports/customers' },
];

const settingItems = [
  { text: 'Cấu hình chung', icon: <SettingsIcon />, path: '/admin/settings/general' },
  { text: 'Cấu hình thanh toán', icon: <PaymentIcon />, path: '/admin/settings/payment' },
  { text: 'Cấu hình vận chuyển', icon: <LocalShippingIcon />, path: '/admin/settings/shipping' },
  { text: 'Cấu hình email', icon: <SettingsIcon />, path: '/admin/settings/email' },
];

const marketingItems = [
  { text: 'Mã giảm giá', icon: <CouponIcon />, path: '/admin/coupons' },
  { text: 'Khuyến mãi', icon: <CampaignIcon />, path: '/admin/promotions' },
  { text: 'Tin tức', icon: <NewsIcon />, path: '/admin/news' },
  { text: 'Đánh giá', icon: <ReviewIcon />, path: '/admin/reviews' },
];

const AdminNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleReportsClick = () => {
    setReportsOpen(!reportsOpen);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleMarketingClick = () => {
    setMarketingOpen(!marketingOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Watch Store Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        
        <Divider />
        
        <ListItemButton onClick={handleMarketingClick}>
          <ListItemIcon>
            <CampaignIcon />
          </ListItemIcon>
          <ListItemText primary="Marketing" />
          {marketingOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={marketingOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {marketingItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItemButton onClick={handleReportsClick}>
          <ListItemIcon>
            <ReportIcon />
          </ListItemIcon>
          <ListItemText primary="Báo cáo & Thống kê" />
          {reportsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {reportItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        
        <ListItemButton onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Cấu hình hệ thống" />
          {settingsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 
             reportItems.find((item) => item.path === location.pathname)?.text ||
             settingItems.find((item) => item.path === location.pathname)?.text || 
             'Watch Store Admin'}
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
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default AdminNavbar; 