import React from 'react';
import '@/admin/static/AdminCommon.css';

export default function ContactManagement() {
  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý thông tin liên hệ</h2>
      </div>
      <form className="admin-form">
        <div>
          <label>
            Hotline 1
            <input type="text" placeholder="Nhập số hotline 1" />
          </label>
        </div>
        <div>
          <label>
            Hotline 2
            <input type="text" placeholder="Nhập số hotline 2" />
          </label>
        </div>
        <div>
          <label>
            Hotline 3
            <input type="text" placeholder="Nhập số hotline 3" />
          </label>
        </div>
        <div>
          <label>
            Email
            <input type="email" placeholder="Nhập địa chỉ email" />
          </label>
        </div>
        <div>
          <label>
            Địa chỉ Facebook
            <input type="text" placeholder="Nhập link Facebook" />
          </label>
        </div>
        <div>
          <label>
            Địa chỉ Youtube
            <input type="text" placeholder="Nhập link Youtube" />
          </label>
        </div>
        <div>
          <label>
            Địa chỉ TikTok
            <input type="text" placeholder="Nhập link TikTok" />
          </label>
        </div>
        <button type="submit" className="admin-btn primary">Lưu thay đổi</button>
      </form>
    </div>
  );
} 