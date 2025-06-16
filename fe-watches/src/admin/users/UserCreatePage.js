import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_ENDPOINTS, AUTH_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

export default function UserCreatePage() {
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    groups_id: [], 
    is_active: true,
    is_staff: false,
    is_superuser: false
  });
  const [groups, setGroups] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách nhóm quyền
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(AUTH_ENDPOINTS.GROUPS, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGroups(Array.isArray(response.data) ? response.data : (response.data.results || []));
      } catch (err) {
        console.error('Lỗi tải danh sách nhóm:', err);
        setGeneralError('Không thể tải danh sách nhóm');
      }
    };
    fetchGroups();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra username
    if (!form.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (form.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Kiểm tra email
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Kiểm tra mật khẩu
    if (!form.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    // Kiểm tra nhóm quyền
    if (!form.is_superuser && form.groups_id.length === 0) {
      newErrors.groups = 'Tài khoản phải thuộc ít nhất 1 nhóm, trừ khi là tài khoản superuser';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'groups') {
      const val = Array.from(e.target.selectedOptions, option => Number(option.value));
      setForm(f => ({ ...f, groups_id: val }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    // Xóa lỗi của trường khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(USER_ENDPOINTS.USERS, {
        ...form,
        groups_id: form.groups_id
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      navigate('/admin/users');
    } catch (err) {
      console.error('Lỗi tạo người dùng:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Xử lý lỗi từ API
        const newErrors = {};
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            newErrors[key] = errorData[key].join(', ');
          } else if (typeof errorData[key] === 'object') {
            newErrors[key] = Object.values(errorData[key]).join(', ');
          } else {
            newErrors[key] = errorData[key];
          }
        });

        // Xử lý các trường hợp đặc biệt
        if (errorData.username?.includes('already exists')) {
          newErrors.username = 'Tên đăng nhập đã tồn tại';
        }
        if (errorData.email?.includes('already exists')) {
          newErrors.email = 'Email đã tồn tại';
        }
        if (errorData.password) {
          newErrors.password = 'Mật khẩu không hợp lệ';
        }

        setErrors(newErrors);
      } else {
        setGeneralError('Không thể kết nối đến máy chủ');
      }
    }
  };

  return (
    <div className="admin-group-create">
      <form onSubmit={handleSubmit} className="admin-form">
        <h2>Thêm người dùng mới</h2>
        
        <label>
          Tên đăng nhập
          <input 
            type="text" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            required 
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </label>
        
        <label>
          Email
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </label>
        
        <label>
          Mật khẩu
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            required
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </label>
        
        <label>
          Nhóm quyền
          <select 
            name="groups" 
            multiple 
            value={form.groups_id} 
            onChange={handleChange}
            disabled={form.is_superuser}
            className={errors.groups ? 'error' : ''}
          >
            {(Array.isArray(groups) ? groups : []).map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {form.is_superuser && <small>Tài khoản superuser không cần nhóm quyền</small>}
          {errors.groups && <div className="error-message">{errors.groups}</div>}
        </label>
        
        <label className="admin-checkbox">
          <input 
            type="checkbox" 
            name="is_active" 
            checked={form.is_active} 
            onChange={handleChange} 
          /> 
          <span className="admin-checkbox-custom"></span>
          Hoạt động
        </label>
        
        <label className="admin-checkbox">
          <input 
            type="checkbox" 
            name="is_staff" 
            checked={form.is_staff} 
            onChange={handleChange} 
          /> 
          <span className="admin-checkbox-custom"></span>
          Nhân viên
        </label>
        
        <label className="admin-checkbox">
          <input 
            type="checkbox" 
            name="is_superuser" 
            checked={form.is_superuser} 
            onChange={(e) => {
              handleChange(e);
              if (e.target.checked) {
                setForm(f => ({ ...f, groups_id: [] }));
              }
            }} 
          /> 
          <span className="admin-checkbox-custom"></span>
          Quản trị viên
        </label>
        
        {generalError && <div className="admin-error">{generalError}</div>}
        
        <button type="submit" className="admin-btn primary">
          Tạo mới
        </button>
      </form>
    </div>
  );
}
