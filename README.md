# Watch Store Backend

Dự án backend cho cửa hàng đồng hồ sử dụng Django REST Framework và PostgreSQL.

## Yêu cầu hệ thống

- Python 3.10.2
- PostgreSQL
- pip (Python package manager)

## Các bước cài đặt

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
pip install django djangorestframework psycopg2-binary python-dotenv
```

3. Tạo file .env trong thư mục gốc của dự án với nội dung:
```
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
DB_NAME=watchesstore
DB_USER=postgres
DB_PASSWORD=ngocviet@123
DB_HOST=localhost
DB_PORT=5432
```

4. Tạo cơ sở dữ liệu PostgreSQL:
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

## Cấu trúc dự án

```
BE_WatchStore/
├── venv/                  # Môi trường ảo Python
├── watchstore/           # Thư mục chứa cấu hình chính của dự án
│   ├── __init__.py
│   ├── settings.py      # Cấu hình dự án
│   ├── urls.py         # Cấu hình URL
│   ├── asgi.py
│   └── wsgi.py
├── manage.py            # Script quản lý Django
├── .env                 # File chứa biến môi trường
└── requirements.txt     # Danh sách các package cần thiết
```

## Cấu hình Database

Dự án sử dụng PostgreSQL với các thông tin kết nối:
- Database: watchesstore
- User: postgres
- Password: ngocviet@123
- Host: localhost
- Port: 5432

## API Endpoints

Sau khi chạy server, bạn có thể truy cập các endpoint sau:
- Admin interface: http://localhost:8000/admin/
- API Root: http://localhost:8000/api/

## Lưu ý

- Đảm bảo PostgreSQL đã được cài đặt và đang chạy
- Kiểm tra kết nối database trước khi chạy migrations
- Không commit file .env lên git
- Thay đổi SECRET_KEY trong môi trường production