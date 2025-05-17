import React, { useState, useEffect, useRef } from 'react';
import '../static/AdminCommon.css';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingBanner, setEditingBanner] = useState({});
  const [newBanner, setNewBanner] = useState({
    title: '',
    image: null,
    link_url: '',
    alt_text: '',
    start_date: '',
    end_date: '',
    display_order: 1,
    is_active: true,
    banner_location: 'homepage',
  });
  const newFileInputRef = useRef();
  const editFileInputRef = useRef();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/content/banners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Lỗi khi lấy danh sách banner');
      const data = await response.json();
      setBanners(data.results || []);
    } catch (error) {
      setError(error.message);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Tạo mới banner
  const handleBannerCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', newBanner.title);
      if (newBanner.image) formData.append('image', newBanner.image);
      formData.append('link_url', newBanner.link_url);
      formData.append('alt_text', newBanner.alt_text);
      // formData.append('start_date', newBanner.start_date || '');
      // formData.append('end_date', newBanner.end_date || '');
      formData.append('display_order', newBanner.display_order);
      formData.append('is_active', newBanner.is_active);
      formData.append('banner_location', newBanner.banner_location);
      const response = await fetch('http://localhost:8000/api/content/banners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Lỗi khi tạo banner');
      }
      const result = await response.json();
      setBanners(prev => [...prev, result]);
      setNewBanner({
        title: '',
        image: null,
        link_url: '',
        alt_text: '',
        // start_date: '',
        // end_date: '',
        display_order: 1,
        is_active: true,
        banner_location: 'homepage',
      });
      if (newFileInputRef.current) newFileInputRef.current.value = '';
    } catch (error) {
      alert(error.message);
    }
  };

  // Sửa banner inline
  const handleBannerEdit = (banner) => {
    setEditingId(banner.id);
    setEditingBanner({
      ...banner,
      image: null, // reset file input
      start_date: banner.start_date ? banner.start_date.substring(0, 10) : '',
      end_date: banner.end_date ? banner.end_date.substring(0, 10) : '',
    });
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleBannerUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', editingBanner.title);
      if (editingBanner.image) formData.append('image', editingBanner.image);
      formData.append('link_url', editingBanner.link_url);
      formData.append('alt_text', editingBanner.alt_text);
      // formData.append('start_date', editingBanner.start_date || '');
      // formData.append('end_date', editingBanner.end_date || '');
      formData.append('display_order', editingBanner.display_order);
      formData.append('is_active', editingBanner.is_active);
      formData.append('banner_location', editingBanner.banner_location);
      const response = await fetch(`http://localhost:8000/api/content/banners/${editingBanner.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Lỗi khi cập nhật banner');
      }
      const result = await response.json();
      setBanners(prev => prev.map(b => b.id === result.id ? result : b));
      setEditingId(null);
      setEditingBanner({});
    } catch (error) {
      alert(error.message);
    }
  };

  // Xóa banner
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/content/banners/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Lỗi khi xóa banner');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý ảnh bìa</h2>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Dòng thêm mới */}
            <tr className="new-item-row">
              <td>+</td>
              <td>
                <input
                  type="file"
                  accept="image/*"
                  ref={newFileInputRef}
                  onChange={e => setNewBanner({...newBanner, image: e.target.files[0]})}
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                  placeholder="Tiêu đề"
                  required
                />
                <input
                  type="text"
                  value={newBanner.link_url}
                  onChange={e => setNewBanner({...newBanner, link_url: e.target.value})}
                  placeholder="Đường dẫn liên kết"
                />
                <input
                  type="text"
                  value={newBanner.alt_text}
                  onChange={e => setNewBanner({...newBanner, alt_text: e.target.value})}
                  placeholder="Alt text"
                />
                {/* <input
                  type="date"
                  value={newBanner.start_date}
                  onChange={e => setNewBanner({...newBanner, start_date: e.target.value})}
                />
                <input
                  type="date"
                  value={newBanner.end_date}
                  onChange={e => setNewBanner({...newBanner, end_date: e.target.value})}
                /> */}
                <input
                  type="number"
                  value={newBanner.display_order}
                  min="1"
                  onChange={e => setNewBanner({...newBanner, display_order: Number(e.target.value)})}
                  placeholder="Thứ tự"
                />
                <input
                  type="text"
                  value={newBanner.banner_location}
                  onChange={e => setNewBanner({...newBanner, banner_location: e.target.value})}
                  placeholder="Vị trí"
                />
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={newBanner.is_active}
                    onChange={e => setNewBanner({...newBanner, is_active: e.target.checked})}
                  />
                  <span>Hoạt động</span>
                </label>
              </td>
              <td colSpan={3}>
                <button
                  className="admin-btn primary"
                  onClick={handleBannerCreate}
                  disabled={!newBanner.title || !newBanner.image}
                >
                  Thêm mới
                </button>
              </td>
            </tr>
            {/* Danh sách banner */}
            {banners.length > 0 ? banners.map((banner, idx) => (
              <tr key={banner.id}>
                <td>{idx + 1}</td>
                <td>
                  {editingId === banner.id ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        ref={editFileInputRef}
                        onChange={e => setEditingBanner({...editingBanner, image: e.target.files[0]})}
                      />
                      {banner.image_url && (
                        <div style={{marginTop: 8}}>
                          <img
                            src={banner.image_url.startsWith('http') ? banner.image_url : `http://localhost:8000${banner.image_url}`}
                            alt={banner.alt_text || banner.title}
                            style={{maxWidth: 120, borderRadius: 4}}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    banner.image_url ? (
                      <img
                        src={banner.image_url.startsWith('http') ? banner.image_url : `http://localhost:8000${banner.image_url}`}
                        alt={banner.alt_text || banner.title}
                        style={{maxWidth: 120, borderRadius: 4}}
                      />
                    ) : 'Không có ảnh'
                  )}
                </td>
                <td>
                  {editingId === banner.id ? (
                    <>
                      <input
                        type="text"
                        value={editingBanner.title}
                        onChange={e => setEditingBanner({...editingBanner, title: e.target.value})}
                        required
                      />
                      <input
                        type="text"
                        value={editingBanner.link_url}
                        onChange={e => setEditingBanner({...editingBanner, link_url: e.target.value})}
                        placeholder="Đường dẫn liên kết"
                      />
                      <input
                        type="text"
                        value={editingBanner.alt_text}
                        onChange={e => setEditingBanner({...editingBanner, alt_text: e.target.value})}
                        placeholder="Alt text"
                      />
                      {/* <input
                        type="date"
                        value={editingBanner.start_date}
                        onChange={e => setEditingBanner({...editingBanner, start_date: e.target.value})}
                      />
                      <input
                        type="date"
                        value={editingBanner.end_date}
                        onChange={e => setEditingBanner({...editingBanner, end_date: e.target.value})}
                      /> */}
                      <input
                        type="number"
                        value={editingBanner.display_order}
                        min="1"
                        onChange={e => setEditingBanner({...editingBanner, display_order: Number(e.target.value)})}
                        placeholder="Thứ tự"
                      />
                      <input
                        type="text"
                        value={editingBanner.banner_location}
                        onChange={e => setEditingBanner({...editingBanner, banner_location: e.target.value})}
                        placeholder="Vị trí"
                      />
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={editingBanner.is_active}
                          onChange={e => setEditingBanner({...editingBanner, is_active: e.target.checked})}
                        />
                        <span>Hoạt động</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <div><b>{banner.title}</b></div>
                      {banner.link_url && <div>Link: {banner.link_url}</div>}
                      {banner.alt_text && <div>Alt: {banner.alt_text}</div>}
                      {banner.start_date && <div>BĐ: {banner.start_date}</div>}
                      {banner.end_date && <div>KT: {banner.end_date}</div>}
                      <div>Thứ tự: {banner.display_order}</div>
                      <div>Vị trí: {banner.banner_location}</div>
                    </>
                  )}
                </td>
                <td>
                  {editingId === banner.id ? null : banner.banner_location}
                </td>
                <td>
                  {editingId === banner.id ? null : (
                    <span className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}>
                      {banner.is_active ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  )}
                </td>
                <td>
                  <div className="admin-table-actions">
                    {editingId === banner.id ? (
                      <>
                        <button className="admin-btn primary" onClick={handleBannerUpdate}>Lưu</button>
                        <button className="admin-btn" onClick={() => { setEditingId(null); setEditingBanner({}); }}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button className="admin-btn" onClick={() => handleBannerEdit(banner)}>Sửa</button>
                        <button className="admin-btn danger" onClick={() => handleDelete(banner.id)}>Xóa</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 