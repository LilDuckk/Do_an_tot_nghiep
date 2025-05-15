import React from 'react';
import '../users/UsersPage.css';

export default function AttributesPage() {
  return (
    <div className="admin-section">
      <h2 style={{color:'var(--color-title)'}}>Quản lý thuộc tính sản phẩm</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table" style={{color:'var(--color-text)'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thuộc tính</th>
              <th>Loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Màu sắc</td>
              <td>Chọn 1</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Kích thước</td>
              <td>Chọn nhiều</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm thuộc tính</button>
    </div>
  );
} 