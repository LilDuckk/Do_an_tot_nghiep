#!/usr/bin/env python
"""
Script để kiểm tra các nhóm hiện có trong hệ thống
"""
import os
import django

# Thiết lập Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import Group

def check_groups():
    """Kiểm tra các nhóm hiện có"""
    
    groups = Group.objects.all()
    
    print("Các nhóm hiện có trong hệ thống:")
    print("-" * 50)
    
    for group in groups:
        print(f"ID: {group.id}, Tên: {group.name}")
        permissions = group.permissions.all()
        if permissions:
            print(f"  Permissions: {[p.codename for p in permissions]}")
        else:
            print("  Permissions: Không có")
        print()
    
    if not groups:
        print("Không có nhóm nào trong hệ thống")

if __name__ == '__main__':
    check_groups() 