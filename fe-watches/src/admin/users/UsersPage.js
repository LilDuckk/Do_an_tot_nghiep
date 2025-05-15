import React from 'react';
import './UsersPage.css';

export default function UsersPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý người dùng</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Nhóm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>admin</td>
              <td>admin@email.com</td>
              <td>Admin</td>
              <td>Hoạt động</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>user1</td>
              <td>user1@email.com</td>
              <td>Khách</td>
              <td>Khóa</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm người dùng</button>
    </div>
  );
} 