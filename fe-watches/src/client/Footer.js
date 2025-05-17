import React from 'react';
import './static/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__col-group">
          <div className="footer__col">
            <div className="footer__col-title">VỀ WATCHSTORE.VN</div>
            <ul>
              <li>Giới thiệu về WatchStore</li>
              <li>Phản ánh - Khiếu nại</li>
              <li>Chứng nhận đại lý</li>
              <li>Tin tức công ty</li>
              <li>Top list đồng hồ</li>
              <li>Kiến thức đồng hồ</li>
            </ul>
          </div>
          <div className="footer__col">
            <div className="footer__col-title">CHÍNH SÁCH CHUNG</div>
            <ul>
              <li>Điều khoản thanh toán</li>
              <li>Chính sách bảo hành</li>
              <li>Chính sách bảo mật</li>
              <li>Chính sách vận chuyển</li>
              <li>Chính sách đổi trả</li>
              <li>Thông tin các trang TMĐT</li>
            </ul>
          </div>
          <div className="footer__col footer__col--region">
            <div className="footer__col-title">CỬA HÀNG MIỀN BẮC</div>
            <ul>
              <li><span className="footer__icon">📍</span> 97 Trần Đại Nghĩa, HBT, Hà Nội<br /><span className="footer__sub">Mở cửa: 8h30 - 22h30 | chỉ đường</span></li>
              <li><span className="footer__icon">📍</span> 58 Trần Đăng Ninh, Cầu Giấy, Hà Nội<br /><span className="footer__sub">Mở cửa: 8h30 - 22h00 | chỉ đường</span></li>
            </ul>
            <div className="footer__col-title">CỬA HÀNG MIỀN TRUNG</div>
            <ul>
              <li><span className="footer__icon">📍</span> 339 Lê Duẩn, Thanh Khê, Đà Nẵng<br /><span className="footer__sub">Mở cửa: 8h30 - 22h00 | chỉ đường</span></li>
            </ul>
            <div className="footer__col-title">CỬA HÀNG MIỀN NAM</div>
            <ul>
              <li><span className="footer__icon">📍</span> 642 CMT8, Thủ Dầu Một, Bình Dương<br /><span className="footer__sub">Mở cửa: 8h30 - 22h00 | chỉ đường</span></li>
              <li><span className="footer__icon">📍</span> 90 Lê Văn Sỹ, P11, Phú Nhuận, TP.HCM<br /><span className="footer__sub">Mở cửa: 8h30 - 22h00 | chỉ đường</span></li>
              <li><span className="footer__icon">📍</span> 61 Quang Trung, P10, Gò Vấp, TP.HCM<br /><span className="footer__sub">Mở cửa: 8h30 - 22h00 | chỉ đường</span></li>
            </ul>
          </div>
          <div className="footer__col footer__col--contact">
            <div className="footer__col-title">LIÊN HỆ HỖ TRỢ</div>
            <ul>
              <li>Hotline 1: <a href="tel:0931892222">093 189 2222</a></li>
              <li>Hotline 2: <a href="tel:0971893333">097 189 3333</a></li>
              <li>Hotline 3: <a href="tel:0961395555">096 139 5555</a></li>
              <li>Email: <a href="mailto:watchstore.donghothat@gmail.com">watchstore.donghothat@gmail.com</a></li>
            </ul>
            <div className="footer__col-title">THEO DÕI CHÚNG TÔI TẠI</div>
            <div className="footer__socials">
              <a href="#" className="footer__social"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="footer__social"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="footer__social"><i className="fa-brands fa-tiktok"></i></a>
              <a href="#" className="footer__social"><i className="fa-brands fa-zalo"></i></a>
              <a href="#" className="footer__social"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__copyright">
        ©2020-2025 by VietCo.vn. Hotline: 099.999.9999
      </div>
    </footer>
  );
} 