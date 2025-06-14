import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Button, Space, Empty, Tag, Alert, message } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [accessErrorMsg, setAccessErrorMsg] = useState('');
  const accessErrorShown = useRef(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const debouncedSearchText = useDebounce(searchText);
  const ITEMS_PER_PAGE = 20;

  const showAccessError = useCallback((msg) => {
    if (!accessErrorShown.current) {
      setHasAccess(false);
      setAccessErrorMsg(msg);
      message.error(msg);
      accessErrorShown.current = true;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`http://localhost:8000/api/account/users/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        showAccessError('Bạn không có quyền xem danh sách này.');
        setUsers([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách người dùng');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setUsers(results);
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText, showAccessError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        showAccessError('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchUsers();
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    if (!users.length) {
      return (
        <div className="admin-pagination">
          <button disabled>Trước</button>
          <div className="page-numbers"><button className="active" disabled>1</button></div>
          <button disabled>Sau</button>
          <span className="page-info">Trang 1 / 1</span>
        </div>
      );
    }
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i || !hasAccess}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="admin-pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || !hasAccess}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || !hasAccess}>Sau</button>
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  };

  return (
    <div className="admin-users-list">
      {!hasAccess && (
        <Alert
          message={accessErrorMsg || "Không có quyền truy cập"}
          description="Bạn không có quyền xem hoặc thực hiện các thao tác trên trang này. Vui lòng liên hệ quản trị viên để được cấp quyền."
          type="error"
          showIcon
          style={{ marginBottom: 16, fontSize: 16, fontWeight: 500, padding: 16 }}
        />
      )}
      <div className="admin-list-header">
        <h2>Quản lý người dùng</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm người dùng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {hasModulePermission('user', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/users/create')}
              disabled={!hasAccess}
            >
              Thêm người dùng
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Nhóm</th>
              <th>Thông tin nhân viên</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.groups?.map(g => g.name).join(', ') || 'Không có'}</td>
                  <td>
                    {u.employee_details ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <UserOutlined style={{ marginRight: '8px' }} />
                          <Tag color="blue">{u.employee_details.name}</Tag>
                          <Tag color="cyan">{u.employee_details.employee_code}</Tag>
                        </div>
                        <div>
                          <ShopOutlined style={{ marginRight: '8px' }} />
                          <Tag color="purple">{u.employee_details.position}</Tag>
                          <Tag color="green">{u.employee_details.store_name}</Tag>
                        </div>
                      </div>
                    ) : (
                      <Tag color="default">Không phải nhân viên</Tag>
                    )}
                  </td>
                  <td>{u.is_active ? 'Hoạt động' : 'Khóa'}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn" onClick={() => navigate(`/admin/users/${u.id}`)} disabled={!hasAccess}>Xem</button>
                    {hasModulePermission('user', 'edit') && (
                      <button className="admin-btn" onClick={() => navigate(`/admin/users/${u.id}/edit`)} disabled={!hasAccess}>Sửa</button>
                    )}
                    {hasModulePermission('user', 'delete') && (
                      <button className="admin-btn danger" onClick={() => handleDelete(u.id)} disabled={!hasAccess}>Xóa</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}