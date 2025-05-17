import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './static/Maintenance.css';

export default function Maintenance() {
  return (
    <div>
      <Header />
      <div className="maintenance-container">
        <h2>Chế độ bảo dưỡng đồng hồ tại VIET&CO.</h2>
        <ul>
          <li>Bảo dưỡng miễn phí 5 năm cho tất cả sản phẩm mua tại cửa hàng.</li>
          <li>Vệ sinh, lau dầu, kiểm tra máy định kỳ miễn phí.</li>
          <li>Thay pin miễn phí trọn đời cho đồng hồ pin.</li>
          <li>Hỗ trợ sửa chữa, thay thế linh kiện chính hãng.</li>
          <li>Đội ngũ kỹ thuật viên chuyên nghiệp, giàu kinh nghiệm.</li>
        </ul>
        <div className="maintenance-note">
          Lưu ý: Vui lòng mang theo phiếu bảo hành khi sử dụng dịch vụ bảo dưỡng.
        </div>
      </div>
      <Footer />
    </div>
  );
} 