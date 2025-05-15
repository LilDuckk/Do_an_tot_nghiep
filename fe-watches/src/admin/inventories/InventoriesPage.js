import React from 'react';
import '../users/UsersPage.css';

export default function InventoriesPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý tồn kho</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cửa hàng</th>
              <th>Sản phẩm</th>
              <th>Biến thể</th>
              <th>Số lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Store 1</td>
              <td>Đồng hồ Casio</td>
              <td>SKU001</td>
              <td>10</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Store 2</td>
              <td>Đồng hồ Rolex</td>
              <td>SKU002</td>
              <td>5</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 