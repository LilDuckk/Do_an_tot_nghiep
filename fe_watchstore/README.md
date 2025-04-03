# Watch Store - Frontend

Dự án website bán đồng hồ sử dụng React và Material-UI.

## Yêu cầu hệ thống

- Node.js (phiên bản 14.0.0 trở lên)
- npm (phiên bản 6.0.0 trở lên)

## Cài đặt

1. Clone dự án về máy:
```bash
git clone <repository-url>
cd fe_watchstore
```

2. Cài đặt các dependencies:
```bash
npm install
```

## Chạy dự án

1. Chạy ở môi trường development:
```bash
npm start
```
Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

2. Build cho production:
```bash
npm run build
```

## Cấu trúc thư mục

```
fe_watchstore/
├── public/
├── src/
│   ├── admin/         # Components cho trang admin
│   ├── auth/          # Components xác thực
│   ├── home/          # Components cho trang chủ
│   ├── layouts/       # Các layout chung
│   ├── assets/        # Assets (css, images, etc.)
│   └── App.js         # Component gốc
├── package.json
└── README.md
```

## Tài khoản demo

1. Tài khoản Admin:
- Email: admin@example.com
- Password: admin123

2. Tài khoản User:
- Email: user@example.com
- Password: user123

## Các tính năng chính

### Phần người dùng
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Giỏ hàng
- Đăng ký/Đăng nhập

### Phần Admin
- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý người dùng
- Quản lý đơn hàng

## Công nghệ sử dụng

- React
- React Router
- Material-UI
- Context API cho state management
- CSS-in-JS

## Scripts có sẵn

- `npm start`: Chạy ứng dụng ở môi trường development
- `npm test`: Chạy test
- `npm run build`: Build ứng dụng cho production
- `npm run eject`: Eject từ Create React App

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request.
