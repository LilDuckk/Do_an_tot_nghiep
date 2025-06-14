import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [parentCategories, setParentCategories] = useState({});
  const navigate = useNavigate();

  const debouncedSearchText = useDebounce(searchText);
  const ITEMS_PER_PAGE = 20;

  const fetchParentCategories = async (ids) => {
    try {
      const token = localStorage.getItem('accessToken');
      const uniqueIds = [...new Set(ids.filter(id => id))];
      if (uniqueIds.length === 0) return;

      const promises = uniqueIds.map(id => 
        fetch(`${PRODUCT_ENDPOINTS.CATEGORY_DETAIL(id)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );

      const results = await Promise.all(promises);
      const parentMap = {};
      results.forEach(category => {
        parentMap[category.id] = category.name;
      });
      setParentCategories(parentMap);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin danh mục cha:', err);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`${PRODUCT_ENDPOINTS.CATEGORIES}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setCategories([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách danh mục');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setCategories(results);
      
      // Lấy thông tin danh mục cha
      const parentIds = results.map(cat => cat.parent).filter(id => id);
      await fetchParentCategories(parentIds);

      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError(err.message);
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PRODUCT_ENDPOINTS.CATEGORY_DETAIL(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchCategories();
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPagination = () => {
    if (!categories.length) {
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

  if (loading && !categories.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-categories-list">
      <div className="admin-list-header">
        <h2>Quản lý danh mục</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {hasModulePermission('category', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/categories/create')}
            >
              Thêm danh mục
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>{c.parent ? parentCategories[c.parent] || 'Đang tải...' : 'Không có'}</td>
                  <td>{c.display_order}</td>
                  <td>{c.is_active ? 'Hoạt động' : 'Ẩn'}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn" onClick={() => navigate(`/admin/categories/${c.id}`)}>Xem</button>
                    {hasModulePermission('category', 'edit') && (
                      <button className="admin-btn" onClick={() => navigate(`/admin/categories/${c.id}/edit`)}>Sửa</button>
                    )}
                    {hasModulePermission('category', 'delete') && (
                      <button className="admin-btn danger" onClick={() => handleDelete(c.id)}>Xóa</button>
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