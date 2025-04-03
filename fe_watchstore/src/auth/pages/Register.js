import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Link,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  paper: {
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  submitButton: {
    marginTop: '20px',
  },
  loginLink: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      // TODO: Thêm logic gọi API đăng ký ở đây
      console.log('Register data:', formData);
      navigate('/login');
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="sm">
        <Paper sx={styles.paper} elevation={3}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Đăng ký tài khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Họ"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tên"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={styles.submitButton}
            >
              Đăng ký
            </Button>
          </form>

          <Box sx={styles.loginLink}>
            <Typography variant="body2">
              Đã có tài khoản?{' '}
              <Link href="/login" underline="hover">
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 