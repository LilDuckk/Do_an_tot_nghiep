import React from 'react';
import '@/admin/static/AdminCommon.css';

export default function NewsManagement() {
  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý tin tức</h2>
        <button className="admin-btn primary">Thêm tin tức mới</button>
      </div>
      <div className="admin-search-bar">
        <div className="search-input-wrapper">
          <input type="text" placeholder="Tìm kiếm tin tức..." />
          <button className="clear-search">×</button>
        </div>
        <button type="submit">Tìm kiếm</button>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Ngày đăng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Ảnh mẫu</td>
              <td>Tin tức mẫu</td>
              <td>Tin công ty</td>
              <td>01/01/2024</td>
              <td>Đã đăng</td>
              <td>
                <div className="admin-table-actions">
                  <button>Sửa</button>
                  <button className="danger">Xóa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="admin-pagination">
        <button>Trước</button>
        <div className="page-numbers">
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
        </div>
        <button>Sau</button>
        <span className="page-info">Trang 1 / 3</span>
      </div>
    </div>
  );
} 