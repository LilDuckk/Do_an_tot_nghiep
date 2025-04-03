import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, TextField, MenuItem, Box } from '@mui/material';

const Product = () => {
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  // Mock data - sẽ được thay thế bằng API call
  const products = [
    {
      id: 1,
      name: 'Đồng hồ Casio',
      price: '1,500,000đ',
      image: 'https://example.com/watch1.jpg',
      category: 'Casio',
    },
    {
      id: 2,
      name: 'Đồng hồ Seiko',
      price: '2,500,000đ',
      image: 'https://example.com/watch2.jpg',
      category: 'Seiko',
    },
    {
      id: 3,
      name: 'Đồng hồ Citizen',
      price: '3,000,000đ',
      image: 'https://example.com/watch3.jpg',
      category: 'Citizen',
    },
  ];

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterBy(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Danh sách sản phẩm
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Sắp xếp theo"
          value={sortBy}
          onChange={handleSortChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="name">Tên sản phẩm</MenuItem>
          <MenuItem value="price-asc">Giá tăng dần</MenuItem>
          <MenuItem value="price-desc">Giá giảm dần</MenuItem>
        </TextField>

        <TextField
          select
          label="Lọc theo thương hiệu"
          value={filterBy}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="casio">Casio</MenuItem>
          <MenuItem value="seiko">Seiko</MenuItem>
          <MenuItem value="citizen">Citizen</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  {product.price}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Product; 