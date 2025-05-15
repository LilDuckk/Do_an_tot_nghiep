import React from 'react';
import './StoresPage.css';

export default function StoresPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý cửa hàng</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên cửa hàng</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Store 1</td>
              <td>123 Đường ABC</td>
              <td>0123456789</td>
              <td>store1@email.com</td>
              <td>Hoạt động</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Store 2</td>
              <td>456 Đường XYZ</td>
              <td>0987654321</td>
              <td>store2@email.com</td>
              <td>Đóng cửa</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm cửa hàng</button>
    </div>
  );
} 