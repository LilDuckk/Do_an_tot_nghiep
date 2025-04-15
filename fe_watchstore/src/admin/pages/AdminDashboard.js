import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Inventory as ProductIcon,
  Store as StoreIcon,
  People as UserIcon,
  LocalOffer as CouponIcon,
  TrendingUp as RevenueIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalStores: 0,
    totalCoupons: 0,
    recentOrders: [],
    lowStockProducts: [],
    recentUsers: [],
    alerts: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleViewOrders = () => {
    navigate('/admin/orders');
  };

  const handleViewProducts = () => {
    navigate('/admin/products');
  };

  const handleViewUsers = () => {
    navigate('/admin/users');
  };

  const handleViewStores = () => {
    navigate('/admin/stores');
  };

  const handleViewCoupons = () => {
    navigate('/admin/coupons');
  };

  const handleViewRevenue = () => {
    navigate('/admin/revenue');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Tổng quan
      </Typography>

      <Grid container spacing={3}>
        {/* Thống kê tổng quan */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RevenueIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Doanh thu</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(dashboardData.totalRevenue)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewRevenue}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <OrderIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Đơn hàng</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalOrders}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewOrders}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ProductIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Sản phẩm</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalProducts}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewProducts}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <UserIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Người dùng</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalUsers}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewUsers}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StoreIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Cửa hàng</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalStores}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewStores}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CouponIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Mã giảm giá</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.totalCoupons}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewCoupons}>
                Xem chi tiết
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Đơn hàng gần đây */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Đơn hàng gần đây</Typography>
              <Button size="small" onClick={handleViewOrders}>
                Xem tất cả
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sản phẩm sắp hết hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Sản phẩm sắp hết hàng</Typography>
              <Button size="small" onClick={handleViewProducts}>
                Xem tất cả
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Tồn kho</TableCell>
                    <TableCell align="right">Giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.stock}
                          color={product.stock <= 5 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Người dùng mới */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Người dùng mới</Typography>
              <Button size="small" onClick={handleViewUsers}>
                Xem tất cả
              </Button>
            </Box>
            <List>
              {dashboardData.recentUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={`Đăng ký: ${formatDate(user.createdAt)}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Cảnh báo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AlertIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Cảnh báo</Typography>
            </Box>
            <List>
              {dashboardData.alerts.map((alert, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={alert.title}
                      secondary={alert.message}
                    />
                  </ListItem>
                  {index < dashboardData.alerts.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
              {dashboardData.alerts.length === 0 && (
                <ListItem>
                  <ListItemText primary="Không có cảnh báo nào" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 