import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Link,
  Alert
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
  registerLink: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      // TODO: Thêm logic gọi API đăng nhập ở đây
      console.log('Login data:', formData);
      
      // Kiểm tra nếu email chứa "admin" thì chuyển đến trang admin
      if (formData.email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="sm">
        <Paper sx={styles.paper} elevation={3}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Đăng nhập
          </Typography>

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

          <Box sx={styles.registerLink}>
            <Typography variant="body2">
              Chưa có tài khoản?{' '}
              <Link href="/register" underline="hover">
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 