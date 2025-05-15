import React from 'react';
import './WarrantiesPage.css';

export default function WarrantiesPage() {
  return (
    <div className="admin-section">
      <h2>Quản lý bảo hành</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã bảo hành</th>
              <th>Sản phẩm</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>BH001</td>
              <td>Đồng hồ Casio</td>
              <td>2024-01-01</td>
              <td>2025-01-01</td>
              <td>Đang bảo hành</td>
              <td><button>Xem</button> <button>Xóa</button></td>
            </tr>
            <tr>
              <td>2</td>
              <td>BH002</td>
              <td>Đồng hồ Rolex</td>
              <td>2023-06-01</td>
              <td>2024-06-01</td>
              <td>Hết hạn</td>
              <td><button>Xem</button> <button>Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 