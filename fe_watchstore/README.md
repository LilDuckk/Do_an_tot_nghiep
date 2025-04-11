# Watch Store Frontend

Dự án frontend cho cửa hàng đồng hồ sử dụng React và Material-UI.

## Yêu cầu hệ thống

- Node.js 18.0.0 trở lên
- npm 9.0.0 trở lên
- Git

## 1. Cài đặt môi trường

### 1.1. Cài đặt Node.js và npm
1. Tải và cài đặt Node.js từ [trang chủ](https://nodejs.org/)
2. Kiểm tra phiên bản:
```bash
node -v
npm -v
```

### 1.2. Clone dự án
```bash
git clone https://github.com/your-username/fe_watchstore.git
cd fe_watchstore
```

### 1.3. Cài đặt dependencies
```bash
npm install
```

### 1.4. Cấu hình môi trường
1. Tạo file `.env` trong thư mục gốc của dự án:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

## 2. Chạy dự án

### 2.1. Development
```bash
npm start
```
Truy cập: http://localhost:3000

### 2.2. Production
```bash
npm run build
```
Sau khi build, các file sẽ được tạo trong thư mục `build/`

## 3. Cấu trúc dự án

```
fe_watchstore/
├── public/                # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/                  # Source code
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── common/     # Common components
│   │   ├── layout/     # Layout components
│   │   └── ui/         # UI components
│   ├── pages/          # Page components
│   │   ├── admin/     # Admin pages
│   │   ├── auth/      # Authentication pages
│   │   ├── cart/      # Cart pages
│   │   ├── checkout/  # Checkout pages
│   │   ├── home/      # Home pages
│   │   ├── product/   # Product pages
│   │   └── user/      # User pages
│   ├── services/      # API services
│   ├── store/         # Redux store
│   ├── utils/         # Utility functions
│   ├── App.js         # Main App component
│   ├── index.js       # Entry point
│   └── routes.js      # Route configuration
├── .env                # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## 4. Tính năng chính

### 4.1. Phần người dùng
- Đăng ký/Đăng nhập
- Xem danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm
- Thêm vào giỏ hàng
- Thanh toán
- Theo dõi đơn hàng
- Đánh giá sản phẩm
- Quản lý thông tin cá nhân

### 4.2. Phần quản trị
- Quản lý sản phẩm
- Quản lý đơn hàng
- Quản lý khách hàng
- Quản lý nhân viên
- Quản lý cửa hàng
- Báo cáo và thống kê
- Quản lý khuyến mãi
- Quản lý tin tức
- Quản lý đánh giá

## 5. Công nghệ sử dụng

### 5.1. Core
- React 18
- React Router 6
- Redux Toolkit
- Material-UI 5
- Axios
- Socket.io

### 5.2. Testing
- Jest
- React Testing Library
- Cypress

### 5.3. Development Tools
- ESLint
- Prettier
- Husky
- lint-staged

## 6. Scripts

```bash
# Development
npm start            # Chạy development server
npm run dev         # Chạy development server với hot reload

# Build
npm run build       # Build cho production
npm run analyze     # Phân tích bundle size

# Testing
npm test            # Chạy unit tests
npm run test:watch  # Chạy tests với watch mode
npm run test:coverage # Chạy tests với coverage
npm run e2e         # Chạy end-to-end tests

# Linting
npm run lint        # Kiểm tra lỗi code
npm run lint:fix    # Tự động sửa lỗi code
npm run format      # Format code

# Deployment
npm run deploy      # Deploy lên production
```

## 7. Quy tắc phát triển

### 7.1. Quy tắc đặt tên
- Components: PascalCase (ví dụ: ProductCard)
- Files: kebab-case (ví dụ: product-card.js)
- Variables: camelCase (ví dụ: productList)
- Constants: UPPER_SNAKE_CASE (ví dụ: API_URL)

### 7.2. Cấu trúc component
```jsx
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // State và hooks
  const [state, setState] = useState(initialState);

  // Functions
  const handleClick = () => {
    // Logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

### 7.3. Quy tắc commit
- feat: Thêm tính năng mới
- fix: Sửa lỗi
- docs: Cập nhật tài liệu
- style: Cập nhật style
- refactor: Tái cấu trúc code
- test: Cập nhật tests
- chore: Cập nhật build process

## 8. Deployment

### 8.1. Yêu cầu
- Node.js server
- Nginx
- SSL certificate
- CDN (cho static files)

### 8.2. Các bước triển khai
1. Build production
2. Set up server
3. Configure Nginx
4. Set up SSL
5. Configure CDN
6. Set up monitoring
7. Set up backup

## 9. Lưu ý

- Sử dụng environment variables cho các thông tin nhạy cảm
- Cập nhật dependencies thường xuyên
- Chạy tests trước khi commit
- Review code trước khi merge
- Backup code thường xuyên
- Monitor performance
- Optimize bundle size
- Sử dụng caching khi cần thiết
- Implement error boundaries
- Sử dụng lazy loading cho routes
- Implement proper error handling
- Sử dụng TypeScript cho type safety
- Implement proper security measures
- Sử dụng Docker cho development và production
