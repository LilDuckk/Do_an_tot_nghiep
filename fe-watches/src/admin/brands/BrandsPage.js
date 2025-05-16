import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchBrands = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search
      });
      const res = await fetch(`http://localhost:8000/api/products/brands/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setBrands([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách thương hiệu');
      const data = await res.json();
      setBrands(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands(currentPage, debouncedSearchTerm);
    // eslint-disable-next-line
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBrands(1, searchTerm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/brands/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchBrands(currentPage, searchTerm);
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
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-brands-list">
      <div className="admin-list-header">
        <h2>Quản lý thương hiệu</h2>
        {hasModulePermission('brand', 'create') && (
          <button className="admin-btn primary" onClick={() => navigate('/admin/brands/create')}>+ Thêm mới</button>
        )}
      </div>
      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button type="submit">Tìm kiếm</button>
      </form>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên thương hiệu</th>
            <th>Mô tả</th>
            <th>Logo</th>
            <th>Thứ tự</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {brands.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.name}</td>
              <td>{b.description}</td>
              <td>{b.logo_url ? <img src={b.logo_url} alt={b.name} style={{width:40}}/> : ''}</td>
              <td>{b.display_order}</td>
              <td>{b.is_active ? 'Hoạt động' : 'Ẩn'}</td>
              <td className="admin-table-actions">
                <button onClick={() => navigate(`/admin/brands/${b.id}`)}>Xem</button>
                {hasModulePermission('brand', 'edit') && (
                  <button onClick={() => navigate(`/admin/brands/${b.id}/edit`)}>Sửa</button>
                )}
                {hasModulePermission('brand', 'delete') && (
                  <button onClick={() => handleDelete(b.id)} className="danger">Xóa</button>
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