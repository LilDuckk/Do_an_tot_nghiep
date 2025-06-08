import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';

export default function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const debouncedSearchText = useDebounce(searchText);
  const ITEMS_PER_PAGE = 20;

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setGroups([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách nhóm');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setGroups(results);
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError(err.message);
      setGroups([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGroups();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhóm này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchGroups();
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    if (!groups.length) {
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
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="admin-pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  };

  if (loading && !groups.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-groups-list">
      <div className="admin-list-header">
        <h2>Quản lý nhóm</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm nhóm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {hasModulePermission('group', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/groups/create')}
            >
              Thêm nhóm
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhóm</th>
              <th>Mô tả</th>
              <th>Số thành viên</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              groups.map(g => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.name}</td>
                  <td>{g.description}</td>
                  <td>{g.user_count || 0}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn" onClick={() => navigate(`/admin/groups/${g.id}`)}>Xem</button>
                    {hasModulePermission('group', 'edit') && (
                      <button className="admin-btn" onClick={() => navigate(`/admin/groups/${g.id}/edit`)}>Sửa</button>
                    )}
                    {hasModulePermission('group', 'delete') && (
                      <button className="admin-btn danger" onClick={() => handleDelete(g.id)}>Xóa</button>
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