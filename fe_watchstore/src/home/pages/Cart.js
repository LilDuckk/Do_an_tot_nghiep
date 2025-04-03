import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/home/pages/Cart.css';

const Cart = () => {
  const navigate = useNavigate();

  // Mock data - sẽ được thay thế bằng state management
  const cartItems = [
    {
      id: 1,
      name: 'Đồng hồ Casio MTP-1374L-1AVDF',
      price: '2,500,000đ',
      quantity: 1,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Đồng hồ Seiko SRPD51K2',
      price: '7,500,000đ',
      quantity: 1,
      image: 'https://via.placeholder.com/150',
    },
  ];

  const handleQuantityChange = (id, change) => {
    console.log(`Change quantity of item ${id} by ${change}`);
  };

  const handleRemoveItem = (id) => {
    console.log(`Remove item ${id} from cart`);
  };

  const calculateTotal = () => {
    return '10,000,000đ';
  };

  return (
    <Container className="cart-container">
      <Typography variant="h4" component="h1" gutterBottom>
        Giỏ hàng
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Paper key={item.id} className="cart-item">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {item.price}
                      </Typography>
                      <Box className="quantity-control">
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </div>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="summary">
            <Typography variant="h6" gutterBottom>
              Tổng đơn hàng
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box className="summary-item">
              <Typography>Tạm tính:</Typography>
              <Typography>{calculateTotal()}</Typography>
            </Box>
            <Box className="summary-item">
              <Typography>Phí vận chuyển:</Typography>
              <Typography>Miễn phí</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box className="summary-item">
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="primary">
                {calculateTotal()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="checkout-button"
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart; 