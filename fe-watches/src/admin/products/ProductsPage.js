import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);


  const ITEMS_PER_PAGE = 20;

  const fetchProducts = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search,
        timestamp: new Date().getTime()
      });
      const res = await fetch(`http://localhost:8000/api/products/products/?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách sản phẩm');
      const data = await res.json();
      setProducts(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
    // eslint-disable-next-line
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, debouncedSearchTerm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/products/${id}/`, {
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
        // Xóa sản phẩm trong danh sách hiện tại
        setProducts(prevProducts => {
          const updatedProducts = prevProducts.filter(product => product.id !== id);
          
          // Nếu sau khi xóa, danh sách rỗng và không phải trang 1 -> về trang trước
          if (updatedProducts.length === 0 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
  
          return updatedProducts;
        });
  
        // Cập nhật lại tổng số trang nếu cần
        setTotalPages(prevTotal => {
          const newCount = (products.length - 1);
          return Math.max(1, Math.ceil(newCount / ITEMS_PER_PAGE));
        });
  
        alert('Đã xóa sản phẩm thành công');
      } else {
        console.error('Delete failed with status:', res.status);
        throw new Error('Xóa sản phẩm thất bại');
      }
    } catch (err) {
      console.error('Delete error:', err);
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
    <div className="admin-products-list">
      <div className="admin-list-header">
        <h2>Quản lý sản phẩm</h2>
        {hasModulePermission('product', 'create') && (
          <button className="admin-btn primary" onClick={() => navigate('/admin/products/create')}>+ Thêm mới</button>
        )}
      </div>
      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả, sku..."
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
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.brand_detail?.name || p.brand}</td>
              <td>{p.category_detail?.name || p.category}</td>
              <td>{p.slug}</td>
              <td>{p.is_active ? 'Hoạt động' : 'Ẩn'}</td>
              <td className="admin-table-actions">
                <button onClick={() => navigate(`/admin/products/${p.id}`)}>Xem</button>
                {hasModulePermission('product', 'edit') && (
                  <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}>Sửa</button>
                )}
                {hasModulePermission('product', 'delete') && (
                  <button onClick={() => handleDelete(p.id)} className="danger">Xóa</button>
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
