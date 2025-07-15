#!/usr/bin/env python
"""
Script import dữ liệu database từ file JSON export
Sử dụng: python exportdata/import_database_data.py --input file.json
"""

import os
import sys
import django
import json
import argparse
from datetime import datetime
from pathlib import Path

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction
from django.apps import apps


def import_database_data(input_file, clear_existing=False, skip_errors=False, dry_run=False):
    """Import dữ liệu từ file JSON export"""
    if not os.path.exists(input_file):
        print(f"❌ File không tồn tại: {input_file}")
        return False

    print(f"🚀 Bắt đầu import dữ liệu từ file: {input_file}")

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file JSON: {e}")
        return False

    if dry_run:
        print("🔍 DRY RUN MODE - Không thực sự import dữ liệu")

    # Thống kê
    total_tables = len(data.get('tables', []))
    total_records = 0
    imported_tables = 0
    imported_records = 0
    errors = []

    print(f"📊 Tổng số bảng: {total_tables}")

    # Xử lý từng bảng
    for table_info in data.get('tables', []):
        table_name = table_info.get('table_name')
        sample_data = table_info.get('sample_data', [])
        
        if not sample_data:
            continue

        print(f"\n📋 Xử lý bảng: {table_name}")
        print(f"   📈 Số records: {len(sample_data)}")

        if dry_run:
            print(f"   [DRY RUN] Sẽ import {len(sample_data)} records")
            total_records += len(sample_data)
            imported_tables += 1
            continue

        try:
            # Clear existing data nếu được yêu cầu
            if clear_existing:
                with connection.cursor() as cursor:
                    cursor.execute(f'DELETE FROM {table_name}')
                print(f"   ✅ Đã xóa dữ liệu cũ")

            # Import dữ liệu
            records_imported = _import_table_data(table_name, sample_data)
            imported_records += records_imported
            imported_tables += 1
            
            print(f"   ✅ Đã import {records_imported} records")

        except Exception as e:
            error_msg = f"❌ Lỗi import bảng {table_name}: {e}"
            print(error_msg)
            errors.append(error_msg)
            
            if not skip_errors:
                raise e

    # Thống kê cuối
    print('\n' + '='*50)
    print('📊 THỐNG KÊ IMPORT')
    print(f"  - Bảng đã xử lý: {imported_tables}/{total_tables}")
    print(f"  - Records đã import: {imported_records}")
    print(f"  - Lỗi: {len(errors)}")
    
    if errors:
        print('\n❌ CÁC LỖI:')
        for error in errors:
            print(f"  - {error}")

    if not dry_run:
        print(f'\n✅ Hoàn thành import dữ liệu!')
    else:
        print(f'\n🔍 DRY RUN hoàn thành - Sẽ import {total_records} records')

    return len(errors) == 0


def _import_table_data(table_name, data):
    """Import dữ liệu vào một bảng cụ thể"""
    if not data:
        return 0

    # Lấy thông tin columns
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}' ORDER BY ordinal_position")
        columns = [row[0] for row in cursor.fetchall()]

    # Chuẩn bị dữ liệu
    records_imported = 0
    
    for record in data:
        try:
            # Chuẩn bị values cho INSERT
            values = []
            placeholders = []
            
            for column in columns:
                if column in record:
                    value = record[column]
                    # Xử lý các kiểu dữ liệu đặc biệt
                    if isinstance(value, str) and value.startswith('202'):
                        # Có thể là datetime
                        try:
                            from datetime import datetime
                            parsed_date = datetime.fromisoformat(value.replace('Z', '+00:00'))
                            values.append(parsed_date)
                        except:
                            values.append(value)
                    elif isinstance(value, (int, float, bool)) or value is None:
                        values.append(value)
                    else:
                        values.append(str(value))
                    placeholders.append('%s')
                else:
                    # Column không có trong data, sử dụng NULL
                    values.append(None)
                    placeholders.append('%s')

            # Thực hiện INSERT
            with connection.cursor() as cursor:
                placeholders_str = ', '.join(placeholders)
                columns_str = ', '.join(columns)
                query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders_str})"
                cursor.execute(query, values)
            
            records_imported += 1

        except Exception as e:
            print(f"     ❌ Lỗi import record: {e}")
            continue

    return records_imported


def import_app_data(input_file, app_name, clear_existing=False, skip_errors=False, dry_run=False):
    """Import dữ liệu của một app cụ thể"""
    if not os.path.exists(input_file):
        print(f"❌ File không tồn tại: {input_file}")
        return False

    print(f"🚀 Import app: {app_name}")
    print(f"📁 File input: {input_file}")

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file JSON: {e}")
        return False

    # Lọc models của app
    app_models = []
    for model_info in data.get('models', []):
        if model_info.get('app_label') == app_name:
            app_models.append(model_info)

    if not app_models:
        print(f"❌ Không tìm thấy models của app '{app_name}' trong file")
        return False

    print(f"📊 Số models: {len(app_models)}")

    # Import từng model
    total_records = 0
    imported_models = 0
    errors = []

    for model_info in app_models:
        model_name = model_info.get('model_name')
        sample_data = model_info.get('sample_data', [])
        
        if not sample_data:
            continue

        print(f"\n📋 Xử lý model: {app_name}.{model_name}")
        print(f"   📈 Số records: {len(sample_data)}")

        if dry_run:
            print(f"   [DRY RUN] Sẽ import {len(sample_data)} records")
            total_records += len(sample_data)
            imported_models += 1
            continue

        try:
            # Tìm model
            try:
                model = apps.get_model(app_name, model_name)
                table_name = model._meta.db_table
            except:
                print(f"   ⚠️ Không tìm thấy model {app_name}.{model_name}, bỏ qua")
                continue

            # Clear existing data nếu được yêu cầu
            if clear_existing:
                model.objects.all().delete()
                print(f"   ✅ Đã xóa dữ liệu cũ")

            # Import dữ liệu
            records_imported = 0
            for record_data in sample_data:
                try:
                    # Xử lý foreign keys
                    for field in model._meta.fields:
                        if field.name in record_data:
                            value = record_data[field.name]
                            if hasattr(field, 'related_model') and field.related_model:
                                # Foreign key field
                                try:
                                    related_obj = field.related_model.objects.get(pk=value)
                                    record_data[field.name] = related_obj
                                except:
                                    # Nếu không tìm thấy related object, bỏ qua record này
                                    print(f"     ⚠️ Không tìm thấy related object cho {field.name}={value}")
                                    continue

                    # Tạo object
                    obj = model(**record_data)
                    obj.save()
                    records_imported += 1

                except Exception as e:
                    print(f"     ❌ Lỗi import record: {e}")
                    if not skip_errors:
                        raise e
                    continue

            print(f"   ✅ Đã import {records_imported} records")
            imported_models += 1

        except Exception as e:
            error_msg = f"❌ Lỗi import model {app_name}.{model_name}: {e}"
            print(error_msg)
            errors.append(error_msg)
            
            if not skip_errors:
                raise e

    # Thống kê
    print('\n📊 THỐNG KÊ IMPORT APP:')
    print(f"  - Models đã xử lý: {imported_models}/{len(app_models)}")
    print(f"  - Records đã import: {total_records}")
    print(f"  - Lỗi: {len(errors)}")

    return len(errors) == 0


def main():
    """Hàm chính"""
    parser = argparse.ArgumentParser(description='Import dữ liệu database từ file JSON')
    parser.add_argument('--input', type=str, required=True, help='File JSON để import')
    parser.add_argument('--app', type=str, help='Chỉ import app cụ thể')
    parser.add_argument('--clear-existing', action='store_true', help='Xóa dữ liệu cũ trước khi import')
    parser.add_argument('--skip-errors', action='store_true', help='Bỏ qua lỗi và tiếp tục import')
    parser.add_argument('--dry-run', action='store_true', help='Chỉ xem sẽ import gì, không thực sự import')
    
    args = parser.parse_args()

    print("🔄 DATABASE IMPORT TOOL")
    print("=" * 50)

    if args.app:
        # Import app cụ thể
        success = import_app_data(
            args.input, 
            args.app, 
            args.clear_existing, 
            args.skip_errors, 
            args.dry_run
        )
    else:
        # Import toàn bộ database
        success = import_database_data(
            args.input, 
            args.clear_existing, 
            args.skip_errors, 
            args.dry_run
        )

    if success:
        print("\n✅ Import thành công!")
    else:
        print("\n❌ Import có lỗi!")
        sys.exit(1)


if __name__ == '__main__':
    main() 