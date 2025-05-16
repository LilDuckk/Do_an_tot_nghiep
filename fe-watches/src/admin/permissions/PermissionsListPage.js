import React, { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';
import { Link} from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';

export default function PermissionsListPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 20;
  const DEBOUNCE_DELAY = 500; // 500ms delay

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // const navigate = useNavigate();

  const fetchPermissions = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search
      });
      
      const res = await fetch(`http://localhost:8000/api/account/auth/permissions/?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setPermissions([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách quyền');
      
      const data = await res.json();
      setPermissions(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchPermissions(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPermissions(1, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchPermissions(1, '');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Bạn chắc chắn muốn xóa quyền này?')) return;
  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const res = await fetch(`http://localhost:8000/api/account/auth/permissions/${id}/`, {
  //       method: 'DELETE',
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (res.status === 403) {
  //       alert('Bạn không có quyền xóa mục này.');
  //       return;
  //     }
  //     if (res.status === 204) fetchPermissions(currentPage, searchTerm);
  //     else throw new Error('Xóa thất bại');
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };

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
    <div className="admin-permissions-list">
      <div className="admin-list-header">
        <h2>Danh sách quyền</h2>
        {hasModulePermission('permission', 'create') && (
          <Link to="/admin/permissions/create" className="admin-btn primary">+ Thêm mới</Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc codename..."
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
            <th>Tên quyền</th>
            <th>Codename</th>
            <th>Content Type</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.codename}</td>
              <td>{p.content_type}</td>
              {/* {hasModulePermission('permission', 'edit') && (
                <td><button onClick={() => navigate(`/admin/permissions/${p.id}/edit`)}>Sửa</button></td>
              )}
              {hasModulePermission('permission', 'delete') && (
                <td><button onClick={() => handleDelete(p.id)} className="danger">Xóa</button></td>
              )} */}
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}
    </div>
  );
}