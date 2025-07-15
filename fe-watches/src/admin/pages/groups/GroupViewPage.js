import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '@/config/api';
import { useAccessControl, useApiCall } from '@/admin/hooks';
import { AccessDeniedAlert } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

export default function GroupViewPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Chuẩn hóa kiểm tra quyền truy cập
  const { hasAccess } = useAccessControl('group', 'view');

  // Hook quản lý API calls
  const { get } = useApiCall();

  // Fetch group data
  const fetchGroup = useCallback(async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      const result = await get(
        `${AUTH_ENDPOINTS.GROUPS}${id}/`,
        {},
        'Lỗi khi lấy thông tin nhóm'
      );

      if (result.success) {
        setGroup(result.data);
      } else {
        setError('Không lấy được thông tin nhóm');
      }
    } catch (error) {
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [id, hasAccess, get]);

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
        setPermissions(Array.isArray(data) ? data : []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    }
  }, [hasAccess, get]);

  // Initialize data
  useEffect(() => {
    if (hasAccess) {
      fetchGroup();
      fetchPermissions();
    }
  }, [hasAccess, fetchGroup, fetchPermissions]);

  if (loading) {
    return (
      <div className="admin-group-view">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-group-view">
        <div className="admin-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
        <Link to="/admin/groups" className="admin-btn">Quay lại</Link>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="admin-group-view">
        <div className="admin-error">Không tìm thấy nhóm</div>
        <Link to="/admin/groups" className="admin-btn">Quay lại</Link>
      </div>
    );
  }

  const groupPerms = permissions.filter(
    p => Array.isArray(group.permissions) && group.permissions.includes(p.id)
  );

  return (
    <div className="admin-group-view">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="group"
        action="view"
        showUserInfo={true}
      />

      <h2>Chi tiết nhóm quyền</h2>
      
      <div className="admin-group-details">
        <div className="detail-item">
          <strong>ID:</strong> {group.id}
        </div>
        <div className="detail-item">
          <strong>Tên nhóm:</strong> {group.name}
        </div>
        <div className="detail-item">
          <strong>Mô tả:</strong> {group.description || 'Không có mô tả'}
        </div>
        <div className="detail-item">
          <strong>Số thành viên:</strong> {group.user_count || 0}
        </div>
        <div className="detail-item">
          <strong>Quyền:</strong>
          <ul className="permissions-list">
            {groupPerms.length > 0 ? (
              groupPerms.map(p => (
                <li key={p.id}>
                  {p.name} <span style={{color:'#888'}}>({p.codename})</span>
                </li>
              ))
            ) : (
              <li>Nhóm này chưa có quyền nào.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="admin-actions" style={{ marginTop: 20 }}>
        {hasAccess && (
          <button 
            className="admin-btn" 
            onClick={() => navigate(`/admin/groups/${group.id}/edit`)}
          >
            Sửa
          </button>
        )}
        <Link to="/admin/groups" className="admin-btn">
          Quay lại
        </Link>
      </div>
    </div>
  );
} 