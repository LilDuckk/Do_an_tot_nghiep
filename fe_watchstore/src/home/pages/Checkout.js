import React from 'react';
import { Container, Typography, Grid, Paper, TextField, Button, Box, Divider } from '@mui/material';

const Checkout = () => {
  // Mock data - sẽ được thay thế bằng API call
  const cartItems = [
    {
      id: 1,
      name: 'Đồng hồ Casio',
      price: '1,500,000đ',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Đồng hồ Seiko',
      price: '2,500,000đ',
      quantity: 1,
    },
  ];

  const total = cartItems.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')), 0);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Thanh toán
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Họ và tên"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Số điện thoại"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Địa chỉ"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Tỉnh/Thành phố"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Quận/Huyện"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đơn hàng
            </Typography>
            {cartItems.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} x {item.price}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Tổng cộng</Typography>
              <Typography variant="h6">{total.toLocaleString()}đ</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Đặt hàng
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout; 