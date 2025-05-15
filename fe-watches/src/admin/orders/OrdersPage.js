import React from 'react';
import './OrdersPage.css';

export default function OrdersPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý đơn hàng</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>DH001</td>
              <td>Nguyễn Văn A</td>
              <td>Đang xử lý</td>
              <td>2024-05-15</td>
              <td><button>Xem</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>DH002</td>
              <td>Trần Thị B</td>
              <td>Hoàn thành</td>
              <td>2024-05-14</td>
              <td><button>Xem</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 