#!/usr/bin/env python
"""
Script để tạo permission view_reports và gán cho các nhóm phù hợp
"""
import os
import django

# Thiết lập Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.reports.models import Report

def create_reports_permission():
    """Tạo permission view_reports và gán cho các nhóm"""
    
    # Lấy content type của model Report
    content_type = ContentType.objects.get_for_model(Report)
    
    # Tạo permission view_reports nếu chưa có
    permission, created = Permission.objects.get_or_create(
        codename='view_reports',
        name='Có thể xem thống kê báo cáo',
        content_type=content_type,
    )
    
    if created:
        print(f"Đã tạo permission: {permission}")
    else:
        print(f"Permission đã tồn tại: {permission}")
    
    # Gán permission cho các nhóm phù hợp (dựa trên nhóm thực tế trong hệ thống)
    groups_to_update = [
        'Quản lý',  # Quản lý - có tất cả quyền
        'Nhân viên bán hàng',  # Nhân viên bán hàng
        'Nhân viên kho',  # Nhân viên kho
        'Nhân viên',  # Nhân viên cơ bản
    ]
    
    for group_name in groups_to_update:
        try:
            group = Group.objects.get(name=group_name)
            group.permissions.add(permission)
            print(f"Đã gán permission cho nhóm: {group_name}")
        except Group.DoesNotExist:
            print(f"Nhóm {group_name} không tồn tại, bỏ qua")
    
    print("\nHoàn thành! Permission view_reports đã được tạo và gán cho các nhóm.")
    print("\nCác nhóm có quyền xem thống kê:")
    for group_name in groups_to_update:
        try:
            group = Group.objects.get(name=group_name)
            has_permission = group.permissions.filter(codename='view_reports').exists()
            print(f"- {group_name}: {'✓' if has_permission else '✗'}")
        except Group.DoesNotExist:
            print(f"- {group_name}: Không tồn tại")

if __name__ == '__main__':
    create_reports_permission() 