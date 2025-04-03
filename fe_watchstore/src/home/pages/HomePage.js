import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const styles = {
  homeContainer: {
    minHeight: '100vh',
  },
  heroSection: {
    background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
    color: 'white',
    padding: '100px 0',
    textAlign: 'center',
    marginBottom: '50px',
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '30px',
    fontWeight: 300,
  },
  viewProductsBtn: {
    padding: '12px 30px',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    },
  },
  featuredProducts: {
    padding: '50px 0',
  },
  productGrid: {
    marginTop: '30px',
  },
  productCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    },
  },
  productImage: {
    height: 200,
    objectFit: 'cover',
  },
  productCardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  viewDetailsBtn: {
    marginTop: 'auto',
  },
};

const HomePage = () => {
  const navigate = useNavigate();

  // Mock data - sẽ được thay thế bằng API call
  const featuredProducts = [
    {
      id: 1,
      name: 'Đồng hồ Casio',
      price: '1,500,000đ',
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 2,
      name: 'Đồng hồ Seiko',
      price: '2,500,000đ',
      image: 'https://via.placeholder.com/300x200',
    },
  ];

  return (
    <Box sx={styles.homeContainer}>
      {/* Hero Section */}
      <Box sx={styles.heroSection}>
        <Container>
          <Typography variant="h1" sx={styles.heroTitle}>
            Chào mừng đến với Watch Store
          </Typography>
          <Typography variant="h2" sx={styles.heroSubtitle}>
            Khám phá bộ sưu tập đồng hồ cao cấp của chúng tôi
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            sx={styles.viewProductsBtn}
            onClick={() => navigate('/products')}
          >
            Xem sản phẩm
          </Button>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container sx={styles.featuredProducts}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Sản phẩm nổi bật
        </Typography>
        <Grid container spacing={4} sx={styles.productGrid}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={styles.productCard}>
                <CardMedia
                  component="img"
                  sx={styles.productImage}
                  image={product.image}
                  alt={product.name}
                />
                <CardContent sx={styles.productCardContent}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {product.price}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    sx={styles.viewDetailsBtn}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 