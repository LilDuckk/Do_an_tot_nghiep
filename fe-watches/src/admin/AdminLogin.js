import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/account/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setError('Lỗi kết nối server!');
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Đăng nhập Admin</h2>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Đăng nhập</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 