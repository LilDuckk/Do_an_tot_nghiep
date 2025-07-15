#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

# Kiểm tra bảng auth_group_permissions
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_group_permissions'
    """)
    result = cursor.fetchone()
    print('auth_group_permissions exists:', result is not None)
    
    if result:
        print('Bảng auth_group_permissions tồn tại trong database')
    else:
        print('Bảng auth_group_permissions KHÔNG tồn tại trong database') 