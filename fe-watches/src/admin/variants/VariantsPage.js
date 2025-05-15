import React from 'react';
import '../users/UsersPage.css';

export default function VariantsPage() {
  return (
    <div className="admin-section">
      <h2 style={{color:'var(--color-title)'}}>Quản lý biến thể sản phẩm</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table" style={{color:'var(--color-text)'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Giá điều chỉnh</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Đồng hồ Casio</td>
              <td>SKU001</td>
              <td>+100.000đ</td>
              <td>Hiển thị</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Đồng hồ Rolex</td>
              <td>SKU002</td>
              <td>+200.000đ</td>
              <td>Ẩn</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm biến thể</button>
    </div>
  );
} 