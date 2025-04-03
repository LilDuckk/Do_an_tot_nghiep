import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
    maxWidth: '400px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  submitButton: {
    marginTop: '20px',
  },
  logo: {
    marginBottom: '30px',
    textAlign: 'center',
  },
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra email có phải admin không
    if (!formData.email.includes('admin')) {
      setError('Bạn không có quyền truy cập trang admin');
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/admin/products');
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập');
    }
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="sm">
        <Paper sx={styles.paper} elevation={3}>
          <Box sx={styles.logo}>
            <Typography variant="h4" component="h1">
              Watch Store
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Trang quản trị
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
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
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
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
              Đăng nhập
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin; 