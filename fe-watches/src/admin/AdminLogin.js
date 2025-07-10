import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosConfig';
import { authService } from '../services/authService';
import { saveUserPermissionsAfterLogin } from '@/services/permission';
import './static/Admin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = await authService.checkAndRefreshToken();
        if (token) {
          // Lấy thông tin user từ API
          const response = await axiosInstance.get('/account/auth/me/');
          if (response.data) {
            const user = response.data;
            let employeeId = null;
            let storeId = null;

            if (user.employee && user.employee.id && user.employee.store) {
              // Trường hợp user có đối tượng employee lồng bên trong
              employeeId = user.employee.id;
              storeId = user.employee.store;
            } else if (user.id && user.store) { 
              // Trường hợp user chính là đối tượng employee (có id và store trực tiếp)
              employeeId = user.id;
              storeId = user.store;
            }

            console.log('User data from /me after processing:', { user, employeeId, storeId }); // Debug log

            localStorage.setItem('adminUser', JSON.stringify({
              ...user,
              employee_id: employeeId,
              store_id: storeId
            }));

            await saveUserPermissionsAfterLogin(response.data);
            localStorage.setItem('user_permission_codenames', JSON.stringify(user.user_permissions || []));
            navigate('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Lỗi tự động đăng nhập:', error);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/account/auth/login/', {
        username,
        password
      });

      if (response.data.access) {
        authService.setTokens(response.data.access, response.data.refresh);
        
        const user = response.data.user;
        let employeeId = null;
        let storeId = null;

        if (user.employee && user.employee.id && user.employee.store) {
          // Trường hợp user có đối tượng employee lồng bên trong
          employeeId = user.employee.id;
          storeId = user.employee.store;
        } else if (user.id && user.store) {
          // Trường hợp user chính là đối tượng employee (có id và store trực tiếp)
          employeeId = user.id;
          storeId = user.store;
        }

        console.log('User data from login after processing:', { user, employeeId, storeId }); // Debug log

        localStorage.setItem('adminUser', JSON.stringify({
          ...user,
          employee_id: employeeId,
          store_id: storeId
        }));

        if (user.is_superuser) {
          localStorage.setItem('is_superuser', 'true');
          // Không cần lưu quyền cho superuser
        } else {
          localStorage.setItem('is_superuser', 'false');
          let permissionCodenames = user.permissions.map(perm => perm.codename);
          localStorage.setItem('user_permission_codenames', JSON.stringify(permissionCodenames));
          localStorage.setItem('user_permissions', JSON.stringify(user.permissions));
        }
        await saveUserPermissionsAfterLogin(response.data.user);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-login-container">
        <div className="loading-spinner"></div>
        <p style={{ color: '#fff', marginTop: '1rem' }}>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <img src={process.env.PUBLIC_URL + '/images/admin-logo.png'} alt="Admin Logo" className="admin-logo" />
      <h2>Đăng nhập Admin</h2>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
          />
          <button 
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img 
              src={process.env.PUBLIC_URL + (showPassword ? '/images/icon-show-password.png' : '/images/icon-close-password.png')}
              alt={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              style={{ width: 22, height: 22 }}
            />
          </button>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 