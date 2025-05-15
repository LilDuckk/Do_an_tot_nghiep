import React from 'react';
import '../users/UsersPage.css';

export default function GroupsPage() {
  return (
    <div className="admin-section">
      <h2 style={{color:'var(--color-title)'}}>Quản lý nhóm quyền</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table" style={{color:'var(--color-text)'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhóm</th>
              <th>Quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Admin</td>
              <td>Thêm, Sửa, Xóa</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Nhân viên</td>
              <td>Xem, Sửa</td>
              <td><button>Sửa</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="admin-add-btn">Thêm nhóm</button>
    </div>
  );
} 