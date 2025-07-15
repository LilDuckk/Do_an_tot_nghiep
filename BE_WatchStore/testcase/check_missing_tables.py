#!/usr/bin/env python
"""
Script kiểm tra các bảng bị thiếu trong backup_models.json
"""

import os
import sys
import django
import json
from pathlib import Path

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.apps import apps


def check_missing_tables():
    """Kiểm tra các bảng bị thiếu"""
    
    # Danh sách bảng cần kiểm tra
    tables_to_check = [
        'useraccount_user_permissions',
        'useraccount_groups', 
        'productvariant_attribute_values',
        'auth_group_permissions',
        'django_migrations'
    ]
    
    print("=== KIỂM TRA CÁC BẢNG BỊ THIẾU ===")
    
    # Kiểm tra bảng nào tồn tại trong database
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN %s
            ORDER BY table_name
        """, (tuple(tables_to_check),))
        
        existing_tables = [row[0] for row in cursor.fetchall()]
    
    print(f"Các bảng tồn tại trong database: {existing_tables}")
    
    # Kiểm tra bảng nào có model tương ứng
    all_models = apps.get_models()
    model_tables = [model._meta.db_table for model in all_models]
    
    print(f"\nCác bảng có model tương ứng: {model_tables}")
    
    # Tìm bảng tồn tại nhưng không có model
    missing_models = []
    for table in existing_tables:
        if table not in model_tables:
            missing_models.append(table)
    
    print(f"\nCác bảng tồn tại nhưng không có model: {missing_models}")
    
    # Phân tích từng bảng
    for table in missing_models:
        print(f"\n--- Phân tích bảng: {table} ---")
        
        # Kiểm tra cấu trúc bảng
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position
            """, (table,))
            
            columns = cursor.fetchall()
            print(f"Số cột: {len(columns)}")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
        
        # Kiểm tra foreign keys
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = %s
            """, (table,))
            
            foreign_keys = cursor.fetchall()
            if foreign_keys:
                print(f"Foreign keys:")
                for fk in foreign_keys:
                    print(f"  - {fk[0]} -> {fk[1]}.{fk[2]}")
            else:
                print("Không có foreign keys")


def check_through_tables():
    """Kiểm tra các through tables (ManyToMany)"""
    print("\n=== KIỂM TRA THROUGH TABLES ===")
    
    all_models = apps.get_models()
    
    for model in all_models:
        for field in model._meta.many_to_many:
            if hasattr(field, 'through') and field.through:
                print(f"Model: {model._meta.app_label}.{model._meta.model_name}")
                print(f"Field: {field.name}")
                print(f"Through table: {field.through._meta.db_table}")
                print(f"Through model: {field.through._meta.app_label}.{field.through._meta.model_name}")
                print("---")


def check_django_system_tables():
    """Kiểm tra các bảng hệ thống Django"""
    print("\n=== KIỂM TRA DJANGO SYSTEM TABLES ===")
    
    django_tables = [
        'django_migrations',
        'django_content_type',
        'django_admin_log',
        'django_session'
    ]
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN %s
            ORDER BY table_name
        """, (tuple(django_tables),))
        
        existing_django_tables = [row[0] for row in cursor.fetchall()]
    
    print(f"Các bảng Django tồn tại: {existing_django_tables}")
    
    # Kiểm tra model tương ứng
    all_models = apps.get_models()
    for table in existing_django_tables:
        model_found = False
        for model in all_models:
            if model._meta.db_table == table:
                print(f"✓ {table} -> {model._meta.app_label}.{model._meta.model_name}")
                model_found = True
                break
        
        if not model_found:
            print(f"✗ {table} -> Không có model tương ứng")


if __name__ == '__main__':
    check_missing_tables()
    check_through_tables()
    check_django_system_tables() 