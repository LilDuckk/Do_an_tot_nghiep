# Dự án Website Bán Đồng Hồ (fe-watches)

Đây là dự án website bán đồng hồ được xây dựng bằng React.js. Dự án sử dụng các công nghệ hiện đại như React Router DOM cho điều hướng, Axios cho việc gọi API, và Chart.js cho việc hiển thị biểu đồ.

## Yêu cầu hệ thống

- Node.js (phiên bản 14.0.0 trở lên)
- npm (phiên bản 6.0.0 trở lên)

## Cài đặt

1. Clone dự án về máy local:
```bash
git clone [URL_REPOSITORY]
cd fe-watches
```

2. Cài đặt các dependencies:
```bash
npm install
```

## Cấu trúc dự án

```
fe-watches/
├── public/          # Chứa các file tĩnh
├── src/            # Mã nguồn chính của ứng dụng
├── package.json    # Quản lý dependencies và scripts
└── README.md       # Tài liệu hướng dẫn
```

## Các lệnh có sẵn

### `npm start`

Chạy ứng dụng ở chế độ development.\
Mở [http://localhost:3000](http://localhost:3000) để xem trong trình duyệt.

Trang sẽ tự động reload khi bạn thay đổi code.\
Bạn cũng có thể thấy các lỗi lint trong console.

### `npm test`

Chạy test runner ở chế độ interactive watch mode.\
Xem thêm thông tin về [running tests](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`

Build ứng dụng cho production vào thư mục `build`.\
Ứng dụng được tối ưu hóa cho hiệu suất tốt nhất.

Build được minify và tên file bao gồm hash.\
Ứng dụng đã sẵn sàng để deploy!

## Công nghệ sử dụng

- React.js
- React Router DOM
- Axios
- Chart.js
- React Chart.js 2

## Hướng dẫn phát triển

1. Đảm bảo bạn đã cài đặt đầy đủ các dependencies
2. Chạy `npm start` để khởi động server development
3. Mở trình duyệt và truy cập http://localhost:3000
4. Bắt đầu phát triển!

## Hướng dẫn deploy

1. Chạy lệnh build:
```bash
npm run build
```

2. Thư mục `build` sẽ chứa phiên bản production của ứng dụng
3. Upload nội dung thư mục `build` lên server của bạn

## Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.
