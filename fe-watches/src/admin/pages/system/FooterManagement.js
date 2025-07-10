import React, { useState, useEffect } from 'react';
import '@/admin/static/AdminCommon.css';

export default function FooterManagement() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    display_order: 1,
    is_active: true
  });
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    category_id: '',
    display_order: 1,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchLinks();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/content/footer-categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setCategories([]);
        return;
      }

      if (!response.ok) throw new Error('Lỗi khi lấy danh sách danh mục');
      
      const data = await response.json();
      setCategories(data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/content/footer-links/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setLinks([]);
        return;
      }

      if (!response.ok) throw new Error('Lỗi khi lấy danh sách liên kết');
      
      const data = await response.json();
      setLinks(data.results || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      setError(error.message);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `http://localhost:8000/api/content/footer-categories/${editingCategory.id}/`
        : 'http://localhost:8000/api/content/footer-categories/';
      const categoryData = editingCategory ? {
        name: editingCategory.name,
        display_order: Number(editingCategory.display_order),
        is_active: editingCategory.is_active !== undefined ? editingCategory.is_active : true
      } : {
        name: newCategory.name,
        display_order: Number(newCategory.display_order),
        is_active: newCategory.is_active !== undefined ? newCategory.is_active : true
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (response.status === 403) {
        alert('Bạn không có quyền thực hiện thao tác này.');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Lỗi khi lưu danh mục');
      }
      const result = await response.json();
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === result.id ? result : c));
      } else {
        setCategories(prev => [...prev, result]);
      }
      setEditingCategory(null);
      setNewCategory({
        name: '',
        display_order: 1,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.message);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const method = editingLink ? 'PUT' : 'POST';
      const url = editingLink 
        ? `http://localhost:8000/api/content/footer-links/${editingLink.id}/`
        : 'http://localhost:8000/api/content/footer-links/';
      const linkData = editingLink ? {
        category_id: Number(editingLink.category_id),
        title: editingLink.title,
        name: editingLink.title,
        url: editingLink.url,
        display_order: Number(editingLink.display_order),
        is_active: editingLink.is_active !== undefined ? editingLink.is_active : true
      } : {
        category_id: Number(newLink.category_id),
        title: newLink.title,
        name: newLink.title,
        url: newLink.url,
        display_order: Number(newLink.display_order),
        is_active: newLink.is_active !== undefined ? newLink.is_active : true
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });
      if (response.status === 403) {
        alert('Bạn không có quyền thực hiện thao tác này.');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Lỗi khi lưu liên kết');
      }
      const result = await response.json();
      if (editingLink) {
        setLinks(prev => prev.map(l => l.id === result.id ? result : l));
      } else {
        setLinks(prev => [...prev, result]);
      }
      setEditingLink(null);
      setNewLink({
        title: '',
        url: '',
        category_id: '',
        display_order: 1,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving link:', error);
      alert(error.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const url = type === 'category' 
        ? `http://localhost:8000/api/content/footer-categories/${id}/`
        : `http://localhost:8000/api/content/footer-links/${id}/`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }

      if (!response.ok) throw new Error('Lỗi khi xóa');

      if (type === 'category') {
        fetchCategories();
      } else {
        fetchLinks();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý thông tin chân trang</h2>
      </div>

      <div className="admin-grid">
        {/* Danh mục Footer */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Danh mục Footer</h3>
          </div>
          <div className="admin-card-body">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên danh mục</th>
                    <th>Thứ tự hiển thị</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Hàng thêm mới */}
                  <tr className="new-item-row">
                    <td>+</td>
                    <td>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        placeholder="Tên danh mục mới"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newCategory.display_order}
                        onChange={(e) => setNewCategory({...newCategory, display_order: parseInt(e.target.value)})}
                        min="1"
                      />
                    </td>
                    <td>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={newCategory.is_active}
                          onChange={(e) => setNewCategory({...newCategory, is_active: e.target.checked})}
                        />
                        <span>Hoạt động</span>
                      </label>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button 
                          className="admin-btn primary"
                          onClick={handleCategorySubmit}
                          disabled={!newCategory.name}
                        >
                          Thêm mới
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Danh sách danh mục */}
                  {categories && categories.length > 0 ? (
                    categories.map((category, index) => (
                      <tr key={category.id}>
                        <td>{index + 1}</td>
                        <td>
                          {editingCategory?.id === category.id ? (
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td>
                          {editingCategory?.id === category.id ? (
                            <input
                              type="number"
                              value={editingCategory.display_order}
                              onChange={(e) => setEditingCategory({...editingCategory, display_order: parseInt(e.target.value)})}
                              min="1"
                            />
                          ) : (
                            category.display_order
                          )}
                        </td>
                        <td>
                          {editingCategory?.id === category.id ? (
                            <label className="admin-checkbox">
                              <input
                                type="checkbox"
                                checked={editingCategory.is_active}
                                onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                              />
                              <span>Hoạt động</span>
                            </label>
                          ) : (
                            <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                              {category.is_active ? 'Hoạt động' : 'Ẩn'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            {editingCategory?.id === category.id ? (
                              <>
                                <button 
                                  className="admin-btn primary"
                                  onClick={handleCategorySubmit}
                                >
                                  Lưu
                                </button>
                                <button 
                                  className="admin-btn"
                                  onClick={() => setEditingCategory(null)}
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="admin-btn"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  Sửa
                                </button>
                                <button 
                                  className="admin-btn danger"
                                  onClick={() => handleDelete('category', category.id)}
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Liên kết Footer */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Liên kết Footer</h3>
          </div>
          <div className="admin-card-body">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tiêu đề</th>
                    <th>URL</th>
                    <th>Danh mục</th>
                    <th>Thứ tự hiển thị</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Hàng thêm mới */}
                  <tr className="new-item-row">
                    <td>+</td>
                    <td>
                      <input
                        type="text"
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        placeholder="Tiêu đề mới"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newLink.url}
                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                        placeholder="URL mới"
                      />
                    </td>
                    <td>
                      <select
                        value={newLink.category_id}
                        onChange={(e) => setNewLink({...newLink, category_id: e.target.value})}
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newLink.display_order}
                        onChange={(e) => setNewLink({...newLink, display_order: parseInt(e.target.value)})}
                        min="1"
                      />
                    </td>
                    <td>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={newLink.is_active}
                          onChange={(e) => setNewLink({...newLink, is_active: e.target.checked})}
                        />
                        <span>Hoạt động</span>
                      </label>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button 
                          className="admin-btn primary"
                          onClick={handleLinkSubmit}
                          disabled={!newLink.title || !newLink.url || !newLink.category_id}
                        >
                          Thêm mới
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Danh sách liên kết */}
                  {links && links.length > 0 ? (
                    links.map((link, index) => (
                      <tr key={link.id}>
                        <td>{index + 1}</td>
                        <td>
                          {editingLink?.id === link.id ? (
                            <input
                              type="text"
                              value={editingLink.title}
                              onChange={(e) => setEditingLink({...editingLink, title: e.target.value})}
                            />
                          ) : (
                            link.title
                          )}
                        </td>
                        <td>
                          {editingLink?.id === link.id ? (
                            <input
                              type="text"
                              value={editingLink.url}
                              onChange={(e) => setEditingLink({...editingLink, url: e.target.value})}
                            />
                          ) : (
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.url}
                            </a>
                          )}
                        </td>
                        <td>
                          {editingLink?.id === link.id ? (
                            <select
                              value={editingLink.category_id}
                              onChange={(e) => setEditingLink({...editingLink, category_id: e.target.value})}
                            >
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            link.category?.name || 'N/A'
                          )}
                        </td>
                        <td>
                          {editingLink?.id === link.id ? (
                            <input
                              type="number"
                              value={editingLink.display_order}
                              onChange={(e) => setEditingLink({...editingLink, display_order: parseInt(e.target.value)})}
                              min="1"
                            />
                          ) : (
                            link.display_order
                          )}
                        </td>
                        <td>
                          {editingLink?.id === link.id ? (
                            <label className="admin-checkbox">
                              <input
                                type="checkbox"
                                checked={editingLink.is_active}
                                onChange={(e) => setEditingLink({...editingLink, is_active: e.target.checked})}
                              />
                              <span>Hoạt động</span>
                            </label>
                          ) : (
                            <span className={`status-badge ${link.is_active ? 'active' : 'inactive'}`}>
                              {link.is_active ? 'Hoạt động' : 'Ẩn'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            {editingLink?.id === link.id ? (
                              <>
                                <button 
                                  className="admin-btn primary"
                                  onClick={handleLinkSubmit}
                                >
                                  Lưu
                                </button>
                                <button 
                                  className="admin-btn"
                                  onClick={() => setEditingLink(null)}
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="admin-btn"
                                  onClick={() => setEditingLink({
                                    ...link,
                                    category_id: link.category?.id || link.category_id || ''
                                  })}
                                >
                                  Sửa
                                </button>
                                <button 
                                  className="admin-btn danger"
                                  onClick={() => handleDelete('link', link.id)}
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 