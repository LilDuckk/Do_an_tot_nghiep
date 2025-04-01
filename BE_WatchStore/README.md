# Watch Store Backend

Dự án backend cho cửa hàng đồng hồ sử dụng Django REST Framework và PostgreSQL.

## Yêu cầu hệ thống

- Python 3.10.2
- PostgreSQL 14+
- Redis (cho Celery và caching)
- pip (Python package manager)

## 1. Cài đặt môi trường

### 1.1. Cài đặt PostgreSQL
1. Tải và cài đặt PostgreSQL từ [trang chủ](https://www.postgresql.org/download/)
2. Tạo database mới:
```sql
CREATE DATABASE watchesstore;
```

### 1.2. Cài đặt Redis
1. Tải và cài đặt Redis từ [trang chủ](https://redis.io/download/)
2. Khởi động Redis server

### 1.3. Cài đặt Python và môi trường ảo
```bash
# Tạo môi trường ảo
python -m venv venv

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
```

## 2. Chạy dự án

### 2.1. Khởi tạo database
```bash
# Tạo migrations
python manage.py makemigrations

# Áp dụng migrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser
```

### 2.2. Chạy Celery (cho background tasks)
```bash
# Terminal 1 - Celery worker
celery -A watchstore worker -l info

# Terminal 2 - Celery beat (cho scheduled tasks)
celery -A watchstore beat -l info
```

### 2.3. Chạy server
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

### 3.3. Ví dụ sử dụng API

#### Quản lý sản phẩm
```bash
# Lấy danh sách sản phẩm
curl -X GET http://localhost:8000/api/products/ \
-H "Authorization: Bearer your_access_token"

# Tạo sản phẩm mới
curl -X POST http://localhost:8000/api/products/ \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{
    "name": "Rolex Submariner",
    "description": "Đồng hồ Rolex Submariner chính hãng",
    "category_id": 1,
    "brand_id": 1,
    "base_price": 50000000
}'
```

#### Quản lý đơn hàng
```bash
# Tạo đơn hàng mới
curl -X POST http://localhost:8000/api/orders/ \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{
    "store_id": 1,
    "customer_id": 1,
    "order_details": [
        {
            "product_id": 1,
            "quantity": 1,
            "unit_price": 50000000
        }
    ],
    "shipping_address": "Hà Nội",
    "shipping_fee": 50000,
    "payment_method": "cash"
}'
```

### 3.4. Các tính năng API
- Authentication với JWT
- Phân quyền người dùng (Admin, Staff, Customer)
- Upload và quản lý hình ảnh
- Tìm kiếm và lọc dữ liệu
- Phân trang
- Caching với Redis
- Background tasks với Celery
- API documentation với Swagger/ReDoc

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
└── static/                # Static files
    └── media/            # Uploaded files
```

## 5. Lưu ý

- Đảm bảo PostgreSQL và Redis đã được cài đặt và đang chạy
- Kiểm tra kết nối database trước khi chạy migrations
- Không commit file .env lên git
- Thay đổi SECRET_KEY trong môi trường production
- Sử dụng HTTPS trong môi trường production
- Backup database định kỳ
- Monitor logs và performance 