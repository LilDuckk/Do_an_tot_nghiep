import React from 'react';
import '../users/UsersPage.css';

export default function CategoriesPage() {
  return (
    <div className="admin-section">
      <h2 style={{color:'var(--color-title)'}}>Quản lý danh mục sản phẩm</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table" style={{color:'var(--color-text)'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Nam</td>
              <td>Đồng hồ nam</td>
              <td>-</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Nữ</td>
              <td>Đồng hồ nữ</td>
              <td>-</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm danh mục</button>
    </div>
  );
} 