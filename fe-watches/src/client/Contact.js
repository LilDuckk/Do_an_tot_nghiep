import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './static/Contact.css';

export default function Contact() {
  return (
    <div>
      <Header />
      <div className="contact-container">
        <h2>Liên hệ với VIET&CO.</h2>
        <div className="contact-info">
          <div><b>Địa chỉ:</b> 123 Đường Đồng Hồ, Quận 1, TP.HCM</div>
          <div><b>Hotline:</b> 0901 234 567</div>
          <div><b>Email:</b> support@vietco.vn</div>
          <div><b>Thời gian làm việc:</b> 8:00 - 21:00 (T2 - CN)</div>
        </div>
        <div className="contact-map">
          <iframe title="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502013993966!2d106.7004233153346!3d10.776373692322073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2zMTIzIMSQxrDhu51uZyDEkOG7kW5nIEjhu5MgLCBRdeG6rW4gMSwgVMOibiBI4buNYyBN4bu5!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s" width="100%" height="220" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
      <Footer />
    </div>
  );
} 