import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Chip,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    note: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      note: order.note || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/${selectedOrder.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        fetchOrders();
        handleClose();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
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

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý đơn hàng
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(order)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">Thông tin đơn hàng</Typography>
                <Typography>Mã đơn hàng: {selectedOrder.id}</Typography>
                <Typography>
                  Ngày đặt:{' '}
                  {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography>
                  Tổng tiền:{' '}
                  {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">Thông tin khách hàng</Typography>
                <Typography>Tên: {selectedOrder.customerName}</Typography>
                <Typography>Email: {selectedOrder.customerEmail}</Typography>
                <Typography>Số điện thoại: {selectedOrder.customerPhone}</Typography>
                <Typography>Địa chỉ: {selectedOrder.shippingAddress}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">Sản phẩm</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="right">Số lượng</TableCell>
                        <TableCell align="right">Đơn giá</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {item.price.toLocaleString('vi-VN')}đ
                          </TableCell>
                          <TableCell align="right">
                            {(item.price * item.quantity).toLocaleString(
                              'vi-VN'
                            )}
                            đ
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                  <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                  <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                  <MenuItem value="CANCELLED">Hủy đơn</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Ghi chú"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManage; 