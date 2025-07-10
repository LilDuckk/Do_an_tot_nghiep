import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '@/services/permission';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';
import { useDebounceSearch } from '@/admin/hooks/useDebounce';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const { debouncedSearchText, currentPage, setCurrentPage } = useDebounceSearch(searchText);
  const ITEMS_PER_PAGE = 20;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText,
        timestamp: new Date().getTime()
      });
      const res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS}?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setProducts([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách sản phẩm');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setProducts(results);
      if (count === 0) {
        setTotalPages(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
  
      if (res.status === 204) {
        setProducts(prevProducts => {
          const updatedProducts = prevProducts.filter(product => product.id !== id);
          if (updatedProducts.length === 0 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
          return updatedProducts;
        });
  
        setTotalPages(prevTotal => {
          const newCount = (products.length - 1);
          return Math.max(1, Math.ceil(newCount / ITEMS_PER_PAGE));
        });
  
        alert('Đã xóa sản phẩm thành công');
      } else {
        throw new Error('Xóa sản phẩm thất bại');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    if (!products.length) {
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

  if (loading && !products.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-products-list">
      <div className="admin-list-header">
        <h2>Quản lý sản phẩm</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {hasModulePermission('product', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/products/create')}
            >
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th>SLUG</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div>Đang tải...</div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.brand_detail?.name || p.brand}</td>
                  <td>{p.category_detail?.name || p.category}</td>
                  <td>{p.slug}</td>
                  <td>{p.is_active ? 'Hoạt động' : 'Ẩn'}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn" onClick={() => navigate(`/admin/products/${p.id}`)}>Xem</button>
                    {hasModulePermission('product', 'edit') && (
                      <button className="admin-btn" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>Sửa</button>
                    )}
                    {hasModulePermission('product', 'delete') && (
                      <button className="admin-btn danger" onClick={() => handleDelete(p.id)}>Xóa</button>
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
