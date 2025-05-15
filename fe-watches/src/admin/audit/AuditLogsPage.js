import React from 'react';
import './AuditLogsPage.css';

export default function AuditLogsPage() {
  return (
    <div className="admin-section">
      <h2>Lịch sử thao tác</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người thao tác</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>admin</td>
              <td>Thêm sản phẩm</td>
              <td>Đồng hồ Casio</td>
              <td>2024-05-15 10:00</td>
            </tr>
            <tr>
              <td>2</td>
              <td>user1</td>
              <td>Xóa đơn hàng</td>
              <td>DH001</td>
              <td>2024-05-14 15:30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 