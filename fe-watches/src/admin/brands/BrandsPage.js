import React from 'react';
import '../users/UsersPage.css';

export default function BrandsPage() {
  return (
    <div className="admin-section">
      <h2 style={{color:'var(--color-title)'}}>Quản lý thương hiệu</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table" style={{color:'var(--color-text)'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thương hiệu</th>
              <th>Mô tả</th>
              <th>Logo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Casio</td>
              <td>Thương hiệu Nhật Bản</td>
              <td><img src="https://example.com/logo1.png" alt="Casio" width="40" /></td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Rolex</td>
              <td>Thương hiệu Thụy Sĩ</td>
              <td><img src="https://example.com/logo2.png" alt="Rolex" width="40" /></td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm thương hiệu</button>
    </div>
  );
} 