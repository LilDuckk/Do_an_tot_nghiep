# Watch Store Project

Dự án cửa hàng đồng hồ trực tuyến với Django REST Framework (Backend) và React (Frontend).

## Cấu trúc dự án

```
watch-store/
├── BE_WatchStore/          # Backend Django
│   ├── apps/              # Các ứng dụng Django
│   ├── config/            # Cấu hình dự án
│   ├── media/             # Media files
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Python dependencies
│
└── fe-watches/            # Frontend React
    ├── src/              # Source code React
    ├── public/           # Static files
    └── package.json      # Node.js dependencies
```

## Yêu cầu hệ thống

### Backend
- Python 3.10.2
- PostgreSQL
- pip (Python package manager)

### Frontend
- Node.js (phiên bản LTS mới nhất)
- npm hoặc yarn

## Cài đặt và Chạy

### Backend

1. Tạo môi trường ảo và kích hoạt:
```bash
# Tạo môi trường ảo
py -3.10 -m venv venv

# Kích hoạt môi trường ảo
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. Cài đặt các package cần thiết:
```bash
cd BE_WatchStore
pip install -r requirements.txt
```

3. Tạo file .env trong thư mục BE_WatchStore:
```
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
DB_NAME=watchesstore
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

4. Tạo và cấu hình database:
```sql
CREATE DATABASE watchesstore;
```

5. Chạy migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Tạo superuser (tùy chọn):
```bash
python manage.py createsuperuser
```

7. Chạy server:
```bash
python manage.py runserver
```

### Frontend

1. Cài đặt dependencies:
```bash
cd fe-watches
npm install
```

2. Tạo file .env:
```
REACT_APP_API_URL=http://localhost:8000/api
```

3. Chạy development server:
```bash
npm start
```

## API Endpoints

Backend API có sẵn tại:
- Admin interface: http://localhost:8000/admin/
- API Root: http://localhost:8000/api/

Frontend chạy tại:
- http://localhost:3000

## Lưu ý quan trọng

- Đảm bảo PostgreSQL đã được cài đặt và đang chạy
- Kiểm tra kết nối database trước khi chạy migrations
- Không commit file .env lên git
- Thay đổi SECRET_KEY trong môi trường production
- Đảm bảo các biến môi trường được cấu hình đúng ở cả frontend và backend

## Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.