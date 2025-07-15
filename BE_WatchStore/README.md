# Watch Store Backend

Dự án backend cho cửa hàng đồng hồ sử dụng Django REST Framework và PostgreSQL.

## Yêu cầu hệ thống

- Python 3.10.2 trở lên
- PostgreSQL 14+
- Redis 7+ (cho Celery và caching)
- pip (Python package manager)
- Node.js 14+ (cho frontend)

## 1. Cài đặt môi trường

### 1.1. Cài đặt PostgreSQL
1. Tải và cài đặt PostgreSQL từ [trang chủ](https://www.postgresql.org/download/)
2. Tạo database mới:
```sql
CREATE DATABASE watchesstore;
```

### 1.2. Cài đặt Redis
1. Tải và cài đặt Redis từ [trang chủ](https://redis.io/download/)
2. Khởi động Redis server:
```bash
# Windows
redis-server

# Linux/Mac
sudo service redis-server start
```

### 1.3. Cài đặt Python và môi trường ảo
```bash
# Tạo môi trường ảo
python -m venv venv

py -m venv venv

# Kích hoạt môi trường ảo
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Cài đặt các package cần thiết
pip install -r requirements.txt
```

### 1.4. Cấu hình môi trường
1. Tạo file `.env` trong thư mục gốc của dự án:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=watchesstore
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=your-region
```

## 2. Chạy dự án

### 2.1. Khởi tạo database
```bash
# Tạo migrations
python manage.py makemigrations

py manage.py makemigrations

# Áp dụng migrations
python manage.py migrate

py manage.py migrate

# Tạo superuser
python manage.py createsuperuser

py manage.py createsuperuser

```

### 2.2. Import dữ liệu từ file JSON
```bash
# Import toàn bộ database (xóa dữ liệu cũ trước)
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --clear-existing --skip-errors

# Import app cụ thể
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --app products --clear-existing --skip-errors

# Dry run để xem sẽ import gì
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --dry-run

# Import không xóa dữ liệu cũ
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --skip-errors
```

**Lưu ý quan trọng về import dữ liệu:**
- Script sẽ tự động xử lý foreign key constraints
- Sắp xếp thứ tự import theo dependencies
- Tự động thử lại các bảng bị lỗi
- Sử dụng `--clear-existing` để xóa dữ liệu cũ trước khi import
- Sử dụng `--skip-errors` để bỏ qua lỗi và tiếp tục import

### 2.3. Chạy Celery (cho background tasks)
```bash
# Terminal 1 - Celery worker
celery -A watchstore worker -l info

# Terminal 2 - Celery beat (cho scheduled tasks)
celery -A watchstore beat -l info
```

### 2.4. Chạy server
```bash
# Development
python manage.py runserver

# Production
gunicorn watchstore.wsgi:application
```

## 3. Sử dụng API

### 3.1. Authentication
1. Đăng ký tài khoản mới:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
-H "Content-Type: application/json" \
-d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "first_name": "Test",
    "last_name": "User"
}'
```

2. Đăng nhập để lấy token:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
-H "Content-Type: application/json" \
-d '{
    "username": "testuser",
    "password": "Test@123"
}'
```

### 3.2. API Documentation
- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

### 3.3. Các tính năng API

#### Quản lý sản phẩm
- CRUD sản phẩm
- Upload hình ảnh
- Tìm kiếm và lọc
- Phân trang
- Quản lý tồn kho

#### Quản lý đơn hàng
- Tạo và quản lý đơn hàng
- Xử lý thanh toán
- Theo dõi trạng thái
- Quản lý vận chuyển

#### Quản lý khách hàng
- Đăng ký/Đăng nhập
- Quản lý thông tin
- Lịch sử mua hàng
- Đánh giá sản phẩm

#### Báo cáo và thống kê
- Doanh thu
- Sản phẩm bán chạy
- Khách hàng tiềm năng
- Tồn kho

### 3.4. Tính năng bảo mật
- JWT Authentication
- Role-based Access Control
- Rate Limiting
- CORS Protection
- CSRF Protection

## 4. Cấu trúc dự án

```
BE_WatchStore/
├── manage.py
├── requirements.txt
├── .env
├── watchstore/              # Project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│   └── wsgi.py
├── products/               # Main app
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── permissions.py
├── orders/                # Order management
├── customers/            # Customer management
├── reports/             # Reporting and analytics
├── exportdata/          # Database export/import tools
│   ├── import_database_data.py
│   └── export_database_data.py
└── static/              # Static files
    └── media/          # Uploaded files
```

## 5. Testing

```bash
# Chạy tests
pytest

# Chạy tests với coverage
pytest --cov=.

# Chạy linting
flake8
black .
isort .
```

## 6. Deployment

### 6.1. Yêu cầu
- PostgreSQL database
- Redis server
- AWS S3 (cho file storage)
- Gunicorn (cho production server)
- Nginx (cho reverse proxy)

### 6.2. Các bước triển khai
1. Cấu hình production settings
2. Set up database
3. Set up static files
4. Set up media files
5. Set up SSL
6. Set up monitoring
7. Set up backup

## 7. Lưu ý

- Đảm bảo PostgreSQL và Redis đã được cài đặt và đang chạy
- Kiểm tra kết nối database trước khi chạy migrations
- Không commit file .env lên git
- Thay đổi SECRET_KEY trong môi trường production
- Sử dụng HTTPS trong môi trường production
- Backup database định kỳ
- Monitor logs và performance
- Sử dụng environment variables cho các thông tin nhạy cảm
- Cập nhật dependencies thường xuyên
- Chạy tests trước khi deploy
- Sử dụng Docker cho development và production 