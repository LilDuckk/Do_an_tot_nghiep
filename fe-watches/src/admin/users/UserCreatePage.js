import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách nhóm quyền
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:8000/api/account/auth/groups/', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGroups(response.data);
      } catch (err) {
        console.error('Lỗi tải danh sách nhóm:', err);
        setError('Không thể tải danh sách nhóm');
      }
    };
    fetchGroups();
  }, []);

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
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    // Nếu không phải superuser, kiểm tra xem đã chọn nhóm chưa
    if (!form.is_superuser && form.groups_id.length === 0) {
      setError('Tài khoản phải thuộc ít nhất 1 group, trừ khi là tài khoản superuser');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:8000/api/account/users/', form, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Nếu tạo thành công, chuyển đến trang danh sách người dùng
      navigate('/admin/users');
    } catch (err) {
      // Xử lý lỗi từ API
      console.error('Lỗi tạo người dùng:', err);
      
      // Kiểm tra và hiển thị thông báo lỗi chi tiết
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const errorMessages = Object.values(errorData).flat();
        setError(errorMessages.join(', ') || 'Tạo người dùng thất bại');
      } else {
        setError('Lỗi kết nối');
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
          />
        </label>
        
        <label>
          Email
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
          />
        </label>
        
        <label>
          Mật khẩu
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
        </label>
        
        <label>
          Nhóm quyền
          <select 
            name="groups" 
            multiple 
            value={form.groups_id} 
            onChange={handleChange}
            disabled={form.is_superuser}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {form.is_superuser && <small>Tài khoản superuser không cần nhóm quyền</small>}
        </label>
        
        <label>
          <input 
            type="checkbox" 
            name="is_active" 
            checked={form.is_active} 
            onChange={handleChange} 
          /> 
          Hoạt động
        </label>
        
        <label>
          <input 
            type="checkbox" 
            name="is_staff" 
            checked={form.is_staff} 
            onChange={handleChange} 
          /> 
          Nhân viên
        </label>
        
        <label>
          <input 
            type="checkbox" 
            name="is_superuser" 
            checked={form.is_superuser} 
            onChange={(e) => {
              handleChange(e);
              // Nếu chọn superuser, xóa các nhóm quyền
              if (e.target.checked) {
                setForm(f => ({ ...f, groups_id: [] }));
              }
            }} 
          /> 
          Quản trị viên
        </label>
        
        {error && <div className="admin-error">{error}</div>}
        
        <button type="submit" className="admin-btn primary">
          Tạo mới
        </button>
      </form>
    </div>
  );
}
