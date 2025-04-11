import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

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
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
      console.log('API URL:', apiUrl);

      // Cấu hình axios
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false // Tắt credentials vì không cần thiết cho JWT
      };

      // Đảm bảo URL khớp với Postman
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
      const loginUrl = `${baseUrl}/auth/login/`;
      console.log('Login URL:', loginUrl);

      const response = await axios.post(
        loginUrl,
        {
          username: formData.username,
          password: formData.password
        },
        axiosConfig
      );

      console.log('Login response:', response.data);

      if (response.data.access) {
        // Kiểm tra role của user
        const userResponse = await axios.get(
          `${baseUrl}/auth/me/`,
          {
            headers: {
              'Authorization': `Bearer ${response.data.access}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('User response:', userResponse.data);

        const userRole = userResponse.data.role;
        
        if (userRole !== 'admin' && userRole !== 'superadmin') {
          setError('Bạn không có quyền truy cập trang quản trị');
          return;
        }

        // Lưu thông tin vào localStorage
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('userRole', userRole);
        
        // Đăng nhập và chuyển hướng
        await login(response.data.access);
        console.log('Đăng nhập thành công, chuyển hướng đến dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        if (err.response.status === 401) {
          setError('Tên đăng nhập hoặc mật khẩu không đúng');
        } else {
          setError(err.response.data?.detail || err.response.data?.message || 'Có lỗi xảy ra khi đăng nhập');
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        console.error('Error:', err.message);
        setError('Có lỗi xảy ra trong quá trình đăng nhập');
      }
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