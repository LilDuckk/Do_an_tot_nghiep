import React, { useEffect, useState } from 'react';
import { AUTH_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';
import '@/admin/static/ProfilePage.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetch(AUTH_ENDPOINTS.ME, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
        localStorage.setItem('adminUser', JSON.stringify(data));
      })
      .catch(() => {
        setError('Không thể lấy thông tin người dùng!');
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setPasswordMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = () => {
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
      return false;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      return false;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      } else {
        setPasswordMessage({ 
          type: 'error', 
          text: data.message || data.detail || 'Đổi mật khẩu thất bại!' 
        });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Có lỗi xảy ra khi đổi mật khẩu!' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };

  const getRoleDisplay = (user) => {
    if (user.is_superuser) return { text: 'Superuser', class: 'role-superuser' };
    if (user.is_staff) return { text: 'Staff', class: 'role-staff' };
    return { text: 'User', class: 'role-user' };
  };

  if (loading) return (
    <div className="profile-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="profile-page">
      <div className="admin-error">{error}</div>
    </div>
  );

  if (!user) return null;

  const roleInfo = getRoleDisplay(user);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(user.username)}
        </div>
        <h2>Thông tin tài khoản</h2>
        <p className="subtitle">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* User Information */}
      <div className="profile-section">
        <h3>Thông tin cơ bản</h3>
        <div className="info-list">
          <div className="info-item">
            <span className="info-label">Tên đăng nhập</span>
            <span className="info-value">{user.username}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Trạng thái</span>
            <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
              {user.is_active ? 'Hoạt động' : 'Khóa'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Vai trò</span>
            <span className={`role-badge ${roleInfo.class}`}>
              {roleInfo.text}
            </span>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="profile-section">
        <h3>Nhóm quyền</h3>
        <div className="info-item">
          <span className="info-label">Các nhóm đã tham gia</span>
          <div className="info-value">
            {user.groups && user.groups.length > 0 ? (
              <div className="groups-list">
                {user.groups.map((group, index) => (
                  <span key={index} className="group-badge">{group.name}</span>
                ))}
              </div>
            ) : (
              <span className="no-groups">Chưa tham gia nhóm nào</span>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="change-password-section">
        <h3>Đổi mật khẩu</h3>
        
        {!showPasswordForm ? (
          <button 
            className="admin-btn primary" 
            onClick={() => setShowPasswordForm(true)}
            style={{ margin: '0 auto', display: 'block' }}
          >
            Đổi mật khẩu
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            {passwordMessage.text && (
              <div className={`admin-error ${passwordMessage.type === 'success' ? 'alert-success' : ''}`}>
                {passwordMessage.text}
              </div>
            )}
            
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <div className="password-toggle">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordData.old_password}
                  onChange={(e) => handlePasswordChange('old_password', e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => togglePasswordVisibility('old')}
                >
                  {showPasswords.old ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <div className="password-toggle">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <div className="password-toggle">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="btn-group">
              <button
                type="submit"
                className="admin-btn primary"
                disabled={passwordLoading}
              >
                {passwordLoading && <span className="loading-spinner"></span>}
                {passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
              
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                  setPasswordMessage({ type: '', text: '' });
                }}
                disabled={passwordLoading}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 