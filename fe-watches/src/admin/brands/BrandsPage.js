import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`${PRODUCT_ENDPOINTS.BRANDS}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setBrands([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách thương hiệu');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setBrands(results);
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError(err.message);
      setBrands([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBrands();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${PRODUCT_ENDPOINTS.BRANDS}${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchBrands();
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    if (!brands.length) {
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

  if (loading && !brands.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-brands-list">
      <div className="admin-list-header">
        <h2>Quản lý thương hiệu</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {hasModulePermission('brand', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/brands/create')}
            >
              Thêm thương hiệu
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
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
            {brands.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              brands.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>{b.description}</td>
                  <td>{b.logo_url ? <img src={b.logo_url} alt={b.name} style={{width:40}}/> : ''}</td>
                  <td>{b.display_order}</td>
                  <td>{b.is_active ? 'Hoạt động' : 'Ẩn'}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn" onClick={() => navigate(`/admin/brands/${b.id}`)}>Xem</button>
                    {hasModulePermission('brand', 'edit') && (
                      <button className="admin-btn" onClick={() => navigate(`/admin/brands/${b.id}/edit`)}>Sửa</button>
                    )}
                    {hasModulePermission('brand', 'delete') && (
                      <button className="admin-btn danger" onClick={() => handleDelete(b.id)}>Xóa</button>
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