# 📊 Database Export/Import Tools

Thư mục này chứa các công cụ để export và import dữ liệu database của dự án Watch Store.

## 📁 Cấu trúc thư mục

```
exportdata/
├── README.md                    # Hướng dẫn sử dụng
├── export_all_data.py          # Script export dữ liệu
├── import_database_data.py     # Script import dữ liệu
├── backup_restore_tool.py      # Tool backup/restore tương tác
└── backups/                    # Thư mục chứa file backup
    └── *.json                  # Các file backup
```

## 🚀 Cách sử dụng

### 1. Export dữ liệu

#### Export toàn bộ database:
```bash
# Export toàn bộ database với dữ liệu
python exportdata/export_all_data.py --type all --limit 1000

# Export chỉ cấu trúc, không có dữ liệu
python exportdata/export_all_data.py --type all --no-data

# Export với tên file tùy chỉnh
python exportdata/export_all_data.py --type all --output my_backup.json
```

#### Export app cụ thể:
```bash
# Export app products
python exportdata/export_all_data.py --type app --app products

# Export app orders với giới hạn records
python exportdata/export_all_data.py --type app --app orders --limit 500
```

#### Export nhiều apps:
```bash
# Export nhiều apps cùng lúc
python exportdata/export_all_data.py --type apps --apps products orders users
```

#### Liệt kê apps có sẵn:
```bash
python exportdata/export_all_data.py --list-apps
```

### 2. Import dữ liệu

#### Import toàn bộ database:
```bash
# Import từ file backup
python exportdata/import_database_data.py --input complete_database_export.json

# Import với dry run (chỉ xem, không thực sự import)
python exportdata/import_database_data.py --input backup.json --dry-run

# Import và xóa dữ liệu cũ
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --clear-existing

# Import và bỏ qua lỗi
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --skip-errors
```

#### Import app cụ thể:
```bash
# Import chỉ app products
python exportdata/import_database_data.py --input complete_database_export_20250716_022117.json --app orders
```

### 3. Tool Backup/Restore tương tác

Chạy tool với giao diện tương tác:
```bash
python exportdata/backup_restore_tool.py
```

Tool này cung cấp menu với các tùy chọn:
- 🔄 Backup toàn bộ database
- 📦 Backup app cụ thể
- 📚 Backup nhiều apps
- ⬇️ Restore database
- 📋 Liệt kê file backup
- 📱 Liệt kê apps có sẵn

## 📋 Ví dụ workflow hoàn chỉnh

### Bước 1: Export dữ liệu từ máy cũ
```bash
# Export toàn bộ database
python exportdata/export_all_data.py --type all --limit 1000 --output watchstore_backup_$(date +%Y%m%d).json

# Hoặc sử dụng tool tương tác
python exportdata/backup_restore_tool.py
# Chọn option 1: Backup toàn bộ database
```

### Bước 2: Copy file backup sang máy mới
```bash
# Copy file JSON sang máy mới
scp watchstore_backup_20241215.json user@new-machine:/path/to/project/exportdata/backups/
```

### Bước 3: Import dữ liệu trên máy mới
```bash
# Setup database trước
python manage.py migrate
python manage.py createsuperuser

# Import dữ liệu với dry run trước
python exportdata/import_database_data.py --input exportdata/backups/watchstore_backup_20241215.json --dry-run

# Import thật
python exportdata/import_database_data.py --input exportdata/backups/watchstore_backup_20241215.json
```

## ⚙️ Các tham số quan trọng

### Export parameters:
- `--type`: Loại export (all/app/apps)
- `--app`: Tên app để export
- `--apps`: Danh sách apps để export
- `--output`: Tên file output
- `--no-data`: Chỉ export cấu trúc, không có dữ liệu
- `--limit`: Giới hạn số records mỗi bảng
- `--list-apps`: Liệt kê apps có sẵn

### Import parameters:
- `--input`: File JSON để import
- `--app`: Chỉ import app cụ thể
- `--clear-existing`: Xóa dữ liệu cũ trước khi import
- `--skip-errors`: Bỏ qua lỗi và tiếp tục import
- `--dry-run`: Chỉ xem sẽ import gì, không thực sự import

## 🔧 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra cấu hình database
python manage.py dbshell

# Kiểm tra migrations
python manage.py showmigrations
```

### Lỗi permission:
```bash
# Đảm bảo user có quyền SELECT/INSERT/UPDATE/DELETE
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
```

### Lỗi encoding:
```bash
# Sử dụng encoding UTF-8
export PYTHONIOENCODING=utf-8
python exportdata/export_all_data.py
```

### Lỗi foreign key:
- Import theo thứ tự dependency: users → stores → products → orders
- Sử dụng `--skip-errors` để bỏ qua lỗi foreign key
- Kiểm tra dữ liệu trước khi import với `--dry-run`

## 📊 Thống kê và monitoring

### Kiểm tra kích thước file backup:
```bash
ls -lh exportdata/backups/
```

### Kiểm tra số lượng records:
```bash
# Trong Django shell
python manage.py shell
>>> from apps.products.models import Product
>>> Product.objects.count()
```

### Backup định kỳ:
```bash
# Tạo script backup tự động
#!/bin/bash
cd /path/to/project
python exportdata/export_all_data.py --type all --limit 1000 --output exportdata/backups/auto_backup_$(date +%Y%m%d_%H%M%S).json
```

## 🛡️ Bảo mật

- Không commit file backup chứa dữ liệu nhạy cảm lên git
- Sử dụng `.gitignore` để loại trừ thư mục `backups/`
- Backup database production trước khi import
- Kiểm tra dữ liệu với `--dry-run` trước khi import thật

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Cấu hình database trong `settings.py`
2. Quyền truy cập database
3. Kết nối mạng (nếu database remote)
4. Logs trong console output 