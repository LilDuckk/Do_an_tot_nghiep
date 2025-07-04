import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';
import { PRODUCT_ENDPOINTS } from '../../config/api';

export default function VariantsPage() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingVariant, setEditingVariant] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const navigate = useNavigate();

  const debouncedSearchText = useDebounce(searchText);
  const ITEMS_PER_PAGE = 20;

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`${PRODUCT_ENDPOINTS.VARIANTS}/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setVariants([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách biến thể');
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setVariants(results);
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError(err.message);
      setVariants([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVariants();
  };

  const handleEdit = (variant) => {
    setEditingId(variant.id);
    setEditingVariant({
      ...variant,
      product_id: variant.product_id || variant.product || (variant.product_detail && variant.product_detail.id),
      price_adjustment: variant.price_adjustment ?? '',
      stock_alert_threshold: variant.stock_alert_threshold ?? '',
      warranty_period: variant.warranty_period ?? '',
      is_active: variant.is_active,
    });
  };

  const handleUpdate = async (v) => {
    try {
      const token = localStorage.getItem('accessToken');
      const body = {
        product_id: editingVariant.product_id,
        price_adjustment: editingVariant.price_adjustment === '' ? null : Number(editingVariant.price_adjustment),
        stock_alert_threshold: editingVariant.stock_alert_threshold === '' ? null : Number(editingVariant.stock_alert_threshold),
        warranty_period: editingVariant.warranty_period === '' ? null : Number(editingVariant.warranty_period),
        is_active: editingVariant.is_active,
      };
      const res = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_DETAIL(v.id)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error('Lỗi khi cập nhật biến thể: ' + JSON.stringify(errorData));
      }
      setEditingId(null);
      setEditingVariant({});
      fetchVariants();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa biến thể này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_DETAIL(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) fetchVariants();
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

      const response = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_UPLOAD_IMAGES(variantId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Lỗi khi upload ảnh');
      
      // Refresh danh sách biến thể để lấy ảnh mới
      fetchVariants();
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
      const response = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_DELETE_IMAGE(variantId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: imageId })
      });

      if (!response.ok) throw new Error('Lỗi khi xóa ảnh');
      
      // Refresh danh sách biến thể để cập nhật ảnh
      fetchVariants();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateImageAltText = async (imageId, altText) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_IMAGE_DETAIL(imageId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alt_text: altText })
      });

      if (!response.ok) throw new Error('Lỗi khi cập nhật mô tả ảnh');
      
      // Refresh danh sách biến thể để cập nhật mô tả ảnh
      fetchVariants();
    } catch (error) {
      alert(error.message);
    }
  };

  const renderPagination = () => {
    if (!variants.length) {
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

  if (loading && !variants.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-variants-list">
      <div className="admin-list-header">
        <h2>Quản lý biến thể</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm biến thể..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>SKU</th>
              <th>Giá điều chỉnh</th>
              <th>Số tồn kho</th>
              <th>Thời hạn bảo hành</th>
              <th>Trạng thái</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              variants.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.product_name}</td>
                  <td>{v.sku}</td>
                  <td>
                    {editingId === v.id ? (
                      <input
                        type="number"
                        value={editingVariant.price_adjustment}
                        onChange={e => setEditingVariant({ ...editingVariant, price_adjustment: e.target.value })}
                        placeholder="Giá điều chỉnh"
                      />
                    ) : (
                      v.price_adjustment !== null && v.price_adjustment !== undefined
                        ? v.price_adjustment.toLocaleString('vi-VN') + 'đ'
                        : ''
                    )}
                  </td>
                  <td>
                    {editingId === v.id ? (
                      <input
                        type="number"
                        value={editingVariant.stock_alert_threshold}
                        onChange={e => setEditingVariant({ ...editingVariant, stock_alert_threshold: e.target.value })}
                        placeholder="Số tồn kho"
                      />
                    ) : (
                      v.stock_alert_threshold !== null && v.stock_alert_threshold !== undefined
                        ? v.stock_alert_threshold
                        : ''
                    )}
                  </td>
                  <td>
                    {editingId === v.id ? (
                      <input
                        type="number"
                        value={editingVariant.warranty_period}
                        onChange={e => setEditingVariant({ ...editingVariant, warranty_period: e.target.value })}
                        placeholder="Tháng bảo hành"
                      />
                    ) : (
                      v.warranty_period !== null && v.warranty_period !== undefined
                        ? `${v.warranty_period} tháng`
                        : ''
                    )}
                  </td>
                  <td>
                    {editingId === v.id ? (
                      <select
                        value={editingVariant.is_active}
                        onChange={e => setEditingVariant({ ...editingVariant, is_active: e.target.value === 'true' })}
                      >
                        <option value={true}>Hoạt động</option>
                        <option value={false}>Ẩn</option>
                      </select>
                    ) : (
                      v.is_active ? 'Hoạt động' : 'Ẩn'
                    )}
                  </td>
                  <td>
                    <div className="variant-images">
                      {v.images?.map(image => (
                        <div key={image.id} className="variant-image-item" style={{ marginBottom: 8 }}>
                          <img
                            src={image.image?.startsWith('http') ? image.image : `http://localhost:8000${image.image}`}
                            alt={image.alt_text || ''}
                            style={{ maxWidth: 80, borderRadius: 4, marginBottom: 4 }}
                          />
                          {editingId === v.id && (
                            <>
                              <input
                                type="text"
                                placeholder="Mô tả ảnh"
                                value={image.alt_text || ''}
                                onChange={e => handleUpdateImageAltText(image.id, e.target.value)}
                                style={{ width: 80, marginBottom: 4 }}
                              />
                              <button
                                className="admin-btn danger"
                                onClick={e => { e.preventDefault(); handleDeleteImage(v.id, image.id); }}
                                style={{ display: 'block', margin: '0 auto' }}
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {editingId === v.id && (
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
                      )}
                    </div>
                  </td>
                  <td className="admin-table-actions">
                    {editingId === v.id ? (
                      <>
                        <button className="admin-btn primary" onClick={() => handleUpdate(v)}>Lưu</button>
                        <button className="admin-btn" onClick={() => setEditingId(null)}>Hủy</button>
                      </>
                    ) : (
                      <button className="admin-btn" onClick={() => handleEdit(v)}>Sửa</button>
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