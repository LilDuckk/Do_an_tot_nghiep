import React from 'react';
import '../static/AdminCommon.css';

export default function StockTakesPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý kiểm kê</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cửa hàng</th>
              <th>Trạng thái</th>
              <th>Ngày kiểm kê</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Store 1</td>
              <td>Đang kiểm kê</td>
              <td>2024-05-15</td>
              <td><button>Xem</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Store 2</td>
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