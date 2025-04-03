import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Rating,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import '../../assets/css/home/pages/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();

  // Mock data - sẽ được thay thế bằng API call
  const product = {
    id,
    name: 'Đồng hồ Casio MTP-1374L-1AVDF',
    price: '2,500,000đ',
    rating: 4.5,
    description: 'Đồng hồ nam Casio MTP-1374L-1AVDF với thiết kế thanh lịch, sang trọng cùng dây đeo bằng da cao cấp, mặt số được thiết kế tinh tế với kim chỉ và vạch số nổi bật, kết hợp với bộ máy Quartz chính xác và độ chống nước 5ATM.',
    image: 'https://via.placeholder.com/500',
    specifications: [
      { label: 'Thương hiệu', value: 'Casio' },
      { label: 'Xuất xứ', value: 'Nhật Bản' },
      { label: 'Bảo hành', value: '12 tháng' },
      { label: 'Chống nước', value: '5 ATM' },
      { label: 'Chất liệu dây', value: 'Dây da cao cấp' },
      { label: 'Chất liệu mặt kính', value: 'Mineral Crystal' },
    ],
  };

  return (
    <Container className="product-container">
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img 
            src={product.image} 
            alt={product.name}
            className="product-image"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="product-info">
            <Typography variant="h4" component="h1">
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Rating value={product.rating} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.rating} sao)
              </Typography>
            </Box>

            <Typography variant="h4" className="product-price">
              {product.price}
            </Typography>

            <Divider />

            <Typography variant="body1" className="product-description">
              {product.description}
            </Typography>

            <Button 
              variant="contained" 
              color="primary"
              size="large"
              fullWidth
              className="add-to-cart-button"
            >
              Thêm vào giỏ hàng
            </Button>

            <Box className="specifications">
              <Typography variant="h6" gutterBottom>
                Thông số kỹ thuật
              </Typography>
              <Grid container spacing={2}>
                {product.specifications.map((spec, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        {spec.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {spec.value}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 