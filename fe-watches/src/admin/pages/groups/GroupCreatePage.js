import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { AUTH_ENDPOINTS } from '@/config/api';
import { useDebounce } from '@/admin/hooks/useDebounce';
import { useAccessControl, useApiCall } from '@/admin/hooks';
import { AccessDeniedAlert } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

export default function GroupCreatePage() {
  const [form, setForm] = useState({ name: '', permissions: [] });
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const navigate = useNavigate();

  // Sử dụng useDebounce cho search permissions
  const debouncedSearchLeft = useDebounce(searchLeft, 300);
  const debouncedSearchRight = useDebounce(searchRight, 300);

  // Chuẩn hóa kiểm tra quyền truy cập
  const { hasAccess } = useAccessControl('group', 'create');

  // Hook quản lý API calls
  const { get, post } = useApiCall();

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        `${AUTH_ENDPOINTS.PERMISSIONS}all/`,
        {},
        'Lỗi khi lấy danh sách quyền'
      );

      if (result.success) {
        const data = result.data;
        setPermissions(Array.isArray(data) ? data : (data.results || []));
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    }
  }, [hasAccess, get]);

  // Initialize permissions data
  useEffect(() => {
    if (hasAccess) {
      fetchPermissions();
    }
  }, [hasAccess, fetchPermissions]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }, []);

  const handleAddPermission = useCallback((id) => {
    setForm(f => ({ ...f, permissions: [...f.permissions, id] }));
  }, []);

  const handleRemovePermission = useCallback((id) => {
    setForm(f => ({ ...f, permissions: f.permissions.filter(pid => pid !== id) }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await post(
        AUTH_ENDPOINTS.GROUPS,
        form,
        'Lỗi khi tạo nhóm'
      );

      if (result.success) {
        message.success('Tạo nhóm thành công');
        navigate('/admin/groups');
      } else {
        setError('Tạo nhóm thất bại');
      }
    } catch (error) {
      setError('Lỗi khi tạo nhóm');
    } finally {
      setLoading(false);
    }
  }, [form, post, navigate]);

  // Quyền chưa chọn - sử dụng debounced search
  const availablePermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => !form.permissions.includes(p.id) && p.name.toLowerCase().includes(debouncedSearchLeft.toLowerCase())
  );

  // Quyền đã chọn - sử dụng debounced search
  const selectedPermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => form.permissions.includes(p.id) && p.name.toLowerCase().includes(debouncedSearchRight.toLowerCase())
  );

  return (
    <div className="admin-group-create">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="group"
        action="create"
        showUserInfo={true}
      />

      <h2>Thêm nhóm quyền mới</h2>
      
      {error && (
        <div className="admin-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Tên nhóm:
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <div className="admin-perm-2col">
          <div className="admin-perm-col">
            <b>Quyền chưa chọn</b>
            <input
              type="text"
              placeholder="Tìm kiếm quyền..."
              value={searchLeft}
              onChange={e => setSearchLeft(e.target.value)}
              disabled={loading}
            />
            <div className="admin-perm-list">
              {availablePermissions.map(p => (
                <div key={p.id} className="admin-perm-item">
                  <span>{p.name}</span>
                  <button 
                    type="button" 
                    className="admin-perm-move-btn" 
                    onClick={() => handleAddPermission(p.id)}
                    disabled={loading}
                  >
                    &gt;&gt;
                  </button>
                </div>
              ))}
              {availablePermissions.length === 0 && (
                <div className="admin-perm-empty">Không có quyền nào</div>
              )}
            </div>
          </div>
          
          <div className="admin-perm-col">
            <b>Quyền đã chọn</b>
            <input
              type="text"
              placeholder="Tìm kiếm quyền..."
              value={searchRight}
              onChange={e => setSearchRight(e.target.value)}
              disabled={loading}
            />
            <div className="admin-perm-list">
              {selectedPermissions.map(p => (
                <div key={p.id} className="admin-perm-item">
                  <span>{p.name}</span>
                  <button 
                    type="button" 
                    className="admin-perm-move-btn" 
                    onClick={() => handleRemovePermission(p.id)}
                    disabled={loading}
                  >
                    &lt;&lt;
                  </button>
                </div>
              ))}
              {selectedPermissions.length === 0 && (
                <div className="admin-perm-empty">Chưa chọn quyền nào</div>
              )}
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="admin-btn primary" 
          style={{ marginTop: 16 }}
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo mới'}
        </button>
      </form>
    </div>
  );
} 