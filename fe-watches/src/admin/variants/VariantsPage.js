import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';

export default function VariantsPage() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchVariants = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search
      });
      const res = await fetch(`http://localhost:8000/api/products/variants/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setVariants([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách biến thể');
      const data = await res.json();
      setVariants(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVariants(currentPage, debouncedSearchTerm);
    // eslint-disable-next-line
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVariants(1, searchTerm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa biến thể này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/variants/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchVariants(currentPage, searchTerm);
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
    <div className="admin-variants-list">
      <div className="admin-list-header">
        <h2>Quản lý biến thể sản phẩm</h2>
        {hasModulePermission('variant', 'create') && (
          <button className="admin-btn primary" onClick={() => navigate('/admin/variants/create')}>+ Thêm mới</button>
        )}
      </div>
      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, sku..."
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
            <th>Sản phẩm</th>
            <th>SKU</th>
            <th>Giá điều chỉnh</th>
            <th>Barcode</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {variants.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.product}</td>
              <td>{v.sku}</td>
              <td>{v.price_adjustment}</td>
              <td>{v.barcode}</td>
              <td>{v.is_active ? 'Hoạt động' : 'Ẩn'}</td>
              <td className="admin-table-actions">
                <button onClick={() => navigate(`/admin/variants/${v.id}`)}>Xem</button>
                {hasModulePermission('variant', 'edit') && (
                  <button onClick={() => navigate(`/admin/variants/${v.id}/edit`)}>Sửa</button>
                )}
                {hasModulePermission('variant', 'delete') && (
                  <button onClick={() => handleDelete(v.id)} className="danger">Xóa</button>
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