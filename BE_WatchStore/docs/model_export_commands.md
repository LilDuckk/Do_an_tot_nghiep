# Hướng dẫn sử dụng Django Management Commands để Export Models

Dự án này có 2 Django management commands để export models từ cơ sở dữ liệu:

## 1. Command `export_models`

Export cấu trúc models dưới dạng JSON với thông tin chi tiết.

### Cách sử dụng cơ bản:

```bash
# Export tất cả models
python manage.py export_models

# Export với tên file tùy chỉnh
python manage.py export_models --output my_models.json

# Export chỉ models của một app cụ thể
python manage.py export_models --app products

# Export chỉ một model cụ thể
python manage.py export_models --model Product

# Export bao gồm sample data
python manage.py export_models --include-data

# Export với giới hạn số lượng records
python manage.py export_models --include-data --limit 5
```

### Các tham số:

- `--output`: Tên file output (mặc định: `models_export.json`)
- `--app`: Chỉ export models của app cụ thể
- `--model`: Chỉ export một model cụ thể
- `--include-data`: Bao gồm sample data từ database
- `--limit`: Giới hạn số lượng records khi include data (mặc định: 10)

### Ví dụ output JSON:

```json
{
  "exported_at": "2024-01-15T10:30:00",
  "database_info": {
    "engine": "django.db.backends.postgresql",
    "name": "watchstore_db",
    "host": "localhost",
    "port": "5432",
    "version": "PostgreSQL 13.4"
  },
  "models": [
    {
      "app_label": "products",
      "model_name": "product",
      "verbose_name": "Product",
      "verbose_name_plural": "Products",
      "db_table": "products_product",
      "fields": [
        {
          "name": "id",
          "type": "BigAutoField",
          "verbose_name": "",
          "null": false,
          "blank": false,
          "default": null,
          "max_length": null,
          "choices": null,
          "help_text": ""
        },
        {
          "name": "name",
          "type": "CharField",
          "verbose_name": "Name",
          "null": false,
          "blank": false,
          "default": null,
          "max_length": 255,
          "choices": null,
          "help_text": "Product name"
        }
      ],
      "relationships": [],
      "meta": {},
      "sample_data": [
        {
          "id": 1,
          "name": "Casio G-Shock",
          "created_at": "2024-01-15T10:00:00"
        }
      ],
      "total_count": 150
    }
  ]
}
```

## 2. Command `generate_models`

Generate Python code cho models từ cấu trúc database.

### Cách sử dụng cơ bản:

```bash
# Generate tất cả models
python manage.py generate_models

# Generate với tên file tùy chỉnh
python manage.py generate_models --output my_models.py

# Generate chỉ models của một app
python manage.py generate_models --app products

# Generate chỉ một model cụ thể
python manage.py generate_models --model Product

# Generate bao gồm Meta class
python manage.py generate_models --include-meta
```

### Các tham số:

- `--output`: Tên file output (mặc định: `generated_models.py`)
- `--app`: Chỉ generate models của app cụ thể
- `--model`: Chỉ generate một model cụ thể
- `--include-meta`: Bao gồm thông tin Meta class

### Ví dụ output Python:

```python
# Generated models from database
# Generated at: 2024-01-15T10:30:00
# This file contains Django models generated from existing database structure

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# App: products

class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name='Name', help_text='Product name')
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        db_table = 'products_product'
        unique_together = [['name', 'category']]
        indexes = [models.Index(fields=['name'], name='product_name_idx')]

    def __str__(self):
        return str(self.name)
```

## Các trường hợp sử dụng:

### 1. Backup cấu trúc database
```bash
python manage.py export_models --output backup_models.json
```

### 2. Phân tích cấu trúc models
```bash
python manage.py export_models --app products --include-data --limit 20
```

### 3. Tạo documentation
```bash
python manage.py export_models --output docs/models_structure.json
```

### 4. Generate models cho dự án mới
```bash
python manage.py generate_models --include-meta --output new_project_models.py
```

### 5. So sánh models giữa các environments
```bash
# Development
python manage.py export_models --output dev_models.json

# Production
python manage.py export_models --output prod_models.json
```

## Lưu ý:

1. **Quyền truy cập database**: Đảm bảo Django có quyền truy cập vào database
2. **Kết nối database**: Commands sẽ sử dụng cấu hình database trong `settings.py`
3. **Performance**: Với database lớn, sử dụng `--limit` để tránh timeout
4. **Security**: Không export data nhạy cảm trong môi trường production
5. **Backup**: Luôn backup database trước khi chạy commands

## Troubleshooting:

### Lỗi kết nối database:
```bash
# Kiểm tra cấu hình database
python manage.py dbshell

# Kiểm tra migrations
python manage.py showmigrations
```

### Lỗi permission:
```bash
# Đảm bảo user có quyền SELECT trên tất cả tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;
```

### Lỗi encoding:
```bash
# Sử dụng encoding UTF-8
export PYTHONIOENCODING=utf-8
python manage.py export_models
``` 