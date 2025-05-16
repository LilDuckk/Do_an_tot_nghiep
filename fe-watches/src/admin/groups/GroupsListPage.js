import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';
import { hasModulePermission } from '../../services/permission';

export default function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;
  const DEBOUNCE_DELAY = 500; // 500ms delay

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  const fetchGroups = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search
      });
      
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setGroups([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách nhóm');
      
      const data = await res.json();
      setGroups(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchGroups(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGroups(1, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchGroups(1, '');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
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
      if (res.status === 204) fetchGroups(currentPage, searchTerm);
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="admin-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <div className="page-numbers">
          {pages}
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
        <span className="page-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-groups-list">
      <div className="admin-list-header">
        <h2>Quản lý nhóm quyền</h2>
        {hasModulePermission('group', 'create') && (
          <Link to="/admin/groups/create" className="admin-btn primary">+ Thêm mới</Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nhóm..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search" 
              onClick={handleClearSearch}
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit">Tìm kiếm</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nhóm</th>
            <th>Quyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.name}</td>
              <td>{g.permissions && g.permissions.length}</td>
              <td className="admin-table-actions">
                <button onClick={() => navigate(`/admin/groups/${g.id}`)}>Xem</button>
                {hasModulePermission('group', 'edit') && (
                  <button onClick={() => navigate(`/admin/groups/${g.id}/edit`)}>Sửa</button>
                )}
                {hasModulePermission('group', 'delete') && (
                  <button onClick={() => handleDelete(g.id)} className="danger">Xóa</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}
    </div>
  );
} 