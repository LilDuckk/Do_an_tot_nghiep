import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api';

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
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('AdminLogin - Login attempt started');
    setError('');
    setLoading(true);

    try {
      console.log('AdminLogin - Sending request to /auth/login/');

      const response = await api.post('/auth/login/', {
        username: formData.username,
        password: formData.password
      });

      console.log('AdminLogin - Response received:', {
        status: response.status,
        hasAccessToken: !!response.data?.access
      });

      if (response.data && response.data.access) {
        console.log('AdminLogin - Login successful, updating auth state');
        // Chỉ lưu access token
        await login(response.data.access);
        
        console.log('AdminLogin - Auth state updated, navigating to dashboard');
        // Chuyển hướng về trang dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('AdminLogin - Login failed: No access token in response');
        setError('Đăng nhập thất bại: Không nhận được token');
      }
    } catch (error) {
      console.error('AdminLogin - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        setError(error.response.data?.error || error.response.data?.detail || 'Đăng nhập thất bại');
      } else if (error.request) {
        setError('Không thể kết nối đến máy chủ');
      } else {
        setError('Có lỗi xảy ra trong quá trình đăng nhập');
      }
    } finally {
      console.log('AdminLogin - Login attempt completed');
      setLoading(false);
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
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={styles.submitButton}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin; 