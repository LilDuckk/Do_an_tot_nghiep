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
  const [attributeSearch, setAttributeSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingVariant, setEditingVariant] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedAttributeSearch = useDebounce(attributeSearch, 500);

  const fetchVariants = async (page = 1, search = '', attrSearch = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search
      });

      // Thêm các giá trị thuộc tính vào query params
      if (attrSearch) {
        const attrValues = attrSearch.split('+').map(value => value.trim()).filter(value => value);
        attrValues.forEach(value => {
          queryParams.append('attr_values', value);
        });
      }

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
    fetchVariants(currentPage, debouncedSearchTerm, debouncedAttributeSearch);
  }, [currentPage, debouncedSearchTerm, debouncedAttributeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVariants(1, searchTerm, attributeSearch);
  };

  const handleEdit = (variant) => {
    setEditingId(variant.id);
    setEditingVariant({
      ...variant,
      product_id: variant.product_id || variant.product || (variant.product_detail && variant.product_detail.id)
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const requestBody = {
        product_id: editingVariant.product_id,
        price_adjustment: editingVariant.price_adjustment,
        is_active: editingVariant.is_active
      };
      const response = await fetch(`http://localhost:8000/api/products/variants/${editingVariant.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Lỗi khi cập nhật biến thể: ' + JSON.stringify(errorData));
      }
      const result = await response.json();
      setVariants(prev => prev.map(v => v.id === result.id ? result : v));
      setEditingId(null);
      setEditingVariant({});
    } catch (error) {
      alert(error.message);
    }
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
      if (res.status === 204) fetchVariants(currentPage, searchTerm, attributeSearch);
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (variantId, files) => {
    if (!files.length) return;
    
    setUploadingImages(prev => ({ ...prev, [variantId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:8000/api/products/variants/${variantId}/upload_images/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Lỗi khi upload ảnh');
      
      // Refresh danh sách biến thể để lấy ảnh mới
      fetchVariants(currentPage, searchTerm, attributeSearch);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImages(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleDeleteImage = async (variantId, imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/variants/${variantId}/delete_image/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: imageId })
      });

      if (!response.ok) throw new Error('Lỗi khi xóa ảnh');
      
      // Refresh danh sách biến thể để cập nhật ảnh
      fetchVariants(currentPage, searchTerm, attributeSearch);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateImageAltText = async (imageId, altText) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/variant-images/${imageId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alt_text: altText })
      });

      if (!response.ok) throw new Error('Lỗi khi cập nhật mô tả ảnh');
      
      // Refresh danh sách biến thể để cập nhật mô tả ảnh
      fetchVariants(currentPage, searchTerm, attributeSearch);
    } catch (error) {
      alert(error.message);
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
            placeholder="Tìm kiếm theo tên sản phẩm, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm theo thuộc tính (vd: màu đỏ+kích thước 40mm)"
            value={attributeSearch}
            onChange={e => setAttributeSearch(e.target.value)}
          />
        </div>
        <button type="submit">Tìm kiếm</button>
      </form>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>SKU</th>
              <th>Giá trị thuộc tính</th>
              <th>Giá điều chỉnh</th>
              <th>Trạng thái</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.product_name}</td>
                <td>{v.sku}</td>
                <td>
                  {v.attribute_values_detail?.map(attr => (
                    <div key={attr.id}>
                      {attr.attribute_type.name}: {attr.value}
                    </div>
                  ))}
                </td>
                <td>
                  {editingId === v.id ? (
                    <input
                      type="number"
                      value={editingVariant.price_adjustment}
                      onChange={e => setEditingVariant({...editingVariant, price_adjustment: e.target.value})}
                      required
                    />
                  ) : (
                    v.price_adjustment
                  )}
                </td>
                <td>
                  {editingId === v.id ? (
                    <select
                      value={editingVariant.is_active}
                      onChange={e => setEditingVariant({...editingVariant, is_active: e.target.value === 'true'})}
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Không hoạt động</option>
                    </select>
                  ) : (
                    v.is_active ? 'Hoạt động' : 'Không hoạt động'
                  )}
                </td>
                <td>
                  <div className="variant-images">
                    {v.images?.map(image => (
                      <div key={image.id} className="variant-image-item">
                        <img 
                          src={image.image.startsWith('http') ? image.image : `http://localhost:8000${image.image}`}
                          alt={image.alt_text || ''}
                          style={{maxWidth: 120, borderRadius: 4}}
                        />
                        <div className="image-actions">
                          <input
                            type="text"
                            placeholder="Mô tả ảnh"
                            value={image.alt_text || ''}
                            onChange={e => handleUpdateImageAltText(image.id, e.target.value)}
                          />
                          <button 
                            className="admin-btn danger"
                            onClick={() => handleDeleteImage(v.id, image.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="image-upload">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleImageUpload(v.id, e.target.files)}
                        disabled={uploadingImages[v.id]}
                      />
                      {uploadingImages[v.id] && <span>Đang tải lên...</span>}
                    </div>
                  </div>
                </td>
                <td className="admin-table-actions">
                  {editingId === v.id ? (
                    <>
                      <button className="admin-btn primary" onClick={handleUpdate}>Lưu</button>
                      <button className="admin-btn" onClick={() => { setEditingId(null); setEditingVariant({}); }}>Hủy</button>
                    </>
                  ) : (
                    <>
                      {hasModulePermission('variant', 'edit') && (
                        <button className="admin-btn" onClick={() => handleEdit(v)}>Sửa</button>
                      )}
                      {hasModulePermission('variant', 'delete') && (
                        <button className="admin-btn danger" onClick={() => handleDelete(v.id)}>Xóa</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
} 