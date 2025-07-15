# Quick Reference - Django Model Commands

## 📋 Các lệnh có sẵn

### 1. `list_models` - Liệt kê models
```bash
# Liệt kê tất cả models
python manage.py list_models

# Liệt kê models của app cụ thể
python manage.py list_models --app products

# Liệt kê với chi tiết fields
python manage.py list_models --detail
```

### 2. `export_models` - Export cấu trúc models ra JSON
```bash
# Export tất cả models
python manage.py export_models

# Export với tên file tùy chỉnh
python manage.py export_models --output my_models.json

# Export chỉ app cụ thể
python manage.py export_models --app products

# Export với sample data
python manage.py export_models --include-data --limit 10
```

### 3. `generate_models` - Generate Python code
```bash
# Generate tất cả models
python manage.py generate_models

# Generate với Meta class
python manage.py generate_models --include-meta

# Generate chỉ app cụ thể
python manage.py generate_models --app products --output products_models.py
```

## 🚀 Các lệnh thường dùng

### Backup cấu trúc database
```bash
python manage.py export_models --output backup_$(date +%Y%m%d).json
```

### Phân tích models
```bash
python manage.py list_models --detail
python manage.py export_models --app products --include-data --limit 5
```

### Tạo documentation
```bash
python manage.py export_models --output docs/models_structure.json
python manage.py generate_models --include-meta --output docs/models_code.py
```

### Test commands
```bash
python testcase/test_model_commands.py
```

## 📁 Cấu trúc files đã tạo

```
apps/core/management/
├── __init__.py
└── commands/
    ├── __init__.py
    ├── list_models.py      # Liệt kê models
    ├── export_models.py    # Export JSON
    └── generate_models.py  # Generate Python code

docs/
├── model_export_commands.md           # Hướng dẫn chi tiết
└── model_commands_quick_reference.md  # Tóm tắt nhanh

testcase/
└── test_model_commands.py             # Script test
```

## ⚠️ Lưu ý quan trọng

1. **Database connection**: Đảm bảo database đang hoạt động
2. **Permissions**: User cần có quyền SELECT trên database
3. **Large databases**: Sử dụng `--limit` để tránh timeout
4. **Production**: Không export data nhạy cảm

## 🔧 Troubleshooting

### Lỗi kết nối
```bash
python manage.py dbshell
```

### Lỗi permission
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;
```

### Lỗi encoding
```bash
export PYTHONIOENCODING=utf-8
python manage.py export_models
``` 