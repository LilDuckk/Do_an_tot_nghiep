import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosConfig';
import { authService } from '../services/authService';
import { saveUserPermissionsAfterLogin } from '../services/permission';
import './static/Admin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isTokenValid()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/account/auth/login/', {
        username,
        password
      });

      if (response.data.access) {
        authService.setTokens(response.data.access, response.data.refresh);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        await saveUserPermissionsAfterLogin(response.data.user);
        localStorage.setItem('user_permission_codenames', JSON.stringify(response.data.user.user_permissions || []));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
      }
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Đăng nhập Admin</h2>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Tên đăng nhập" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Mật khẩu" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Đăng nhập</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 