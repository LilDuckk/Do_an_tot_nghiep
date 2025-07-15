#!/usr/bin/env python
"""
Script export toàn bộ dữ liệu database
Sử dụng: python exportdata/export_all_data.py
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

from django.core.management import call_command
from django.db import connection


def export_all_tables(output_file='complete_database_export.json', include_data=True, limit=1000):
    """Export toàn bộ database"""
    print(f"🚀 Bắt đầu export toàn bộ database...")
    print(f"📁 File output: {output_file}")
    print(f"📊 Bao gồm dữ liệu: {include_data}")
    print(f"📈 Giới hạn records: {limit}")
    
    try:
        call_command(
            'export_all_tables',
            output=output_file,
            include_data=include_data,
            limit=limit
        )
        
        # Kiểm tra file đã tạo
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
            print(f"✅ Export hoàn thành!")
            print(f"📏 Kích thước file: {file_size:.2f} MB")
            print(f"📁 Đường dẫn: {os.path.abspath(output_file)}")
            return True
        else:
            print(f"❌ Lỗi: File không được tạo")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi export: {e}")
        return False


def export_app_data(app_name, output_file=None, include_data=True, limit=1000):
    """Export dữ liệu của một app cụ thể"""
    if output_file is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'{app_name}_export_{timestamp}.json'
    
    print(f"🚀 Export app: {app_name}")
    print(f"📁 File output: {output_file}")
    print(f"📊 Bao gồm dữ liệu: {include_data}")
    print(f"📈 Giới hạn records: {limit}")
    
    try:
        call_command(
            'export_models',
            app=app_name,
            output=output_file,
            include_data=include_data,
            limit=limit
        )
        
        # Kiểm tra file đã tạo
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
            print(f"✅ Export app {app_name} hoàn thành!")
            print(f"📏 Kích thước file: {file_size:.2f} MB")
            print(f"📁 Đường dẫn: {os.path.abspath(output_file)}")
            return True
        else:
            print(f"❌ Lỗi: File không được tạo")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi export app {app_name}: {e}")
        return False


def export_multiple_apps(apps_list, include_data=True, limit=1000):
    """Export nhiều app cùng lúc"""
    print(f"🚀 Export nhiều apps: {', '.join(apps_list)}")
    
    results = []
    for app_name in apps_list:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f'{app_name}_export_{timestamp}.json'
        
        success = export_app_data(app_name, output_file, include_data, limit)
        results.append({
            'app': app_name,
            'file': output_file,
            'success': success
        })
    
    # Thống kê
    print("\n📊 THỐNG KÊ EXPORT:")
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"✅ Thành công: {len(successful)}/{len(results)}")
    print(f"❌ Thất bại: {len(failed)}/{len(results)}")
    
    if failed:
        print("\n❌ Apps thất bại:")
        for result in failed:
            print(f"  - {result['app']}")
    
    return results


def get_available_apps():
    """Lấy danh sách các app có sẵn"""
    from django.apps import apps
    return [app.label for app in apps.get_app_configs() if not app.label.startswith('django')]


def main():
    """Hàm chính"""
    parser = argparse.ArgumentParser(description='Export dữ liệu database')
    parser.add_argument('--type', choices=['all', 'app', 'apps'], default='all',
                       help='Loại export: all (toàn bộ), app (một app), apps (nhiều app)')
    parser.add_argument('--app', type=str, help='Tên app để export (cho --type app)')
    parser.add_argument('--apps', nargs='+', help='Danh sách apps để export (cho --type apps)')
    parser.add_argument('--output', type=str, help='Tên file output')
    parser.add_argument('--no-data', action='store_true', help='Không bao gồm dữ liệu, chỉ export cấu trúc')
    parser.add_argument('--limit', type=int, default=1000, help='Giới hạn số records (mặc định: 1000)')
    parser.add_argument('--list-apps', action='store_true', help='Liệt kê các app có sẵn')
    
    args = parser.parse_args()
    
    print("🔄 DATABASE EXPORT TOOL")
    print("=" * 50)
    
    # Liệt kê apps nếu được yêu cầu
    if args.list_apps:
        apps = get_available_apps()
        print("📋 Danh sách apps có sẵn:")
        for i, app in enumerate(apps, 1):
            print(f"  {i:2d}. {app}")
        return
    
    # Xác định loại export
    include_data = not args.no_data
    
    if args.type == 'all':
        # Export toàn bộ database
        output_file = args.output or f'complete_database_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        export_all_tables(output_file, include_data, args.limit)
        
    elif args.type == 'app':
        # Export một app
        if not args.app:
            print("❌ Cần chỉ định --app cho loại export 'app'")
            return
        
        if args.app not in get_available_apps():
            print(f"❌ App '{args.app}' không tồn tại")
            print("Sử dụng --list-apps để xem danh sách apps có sẵn")
            return
        
        export_app_data(args.app, args.output, include_data, args.limit)
        
    elif args.type == 'apps':
        # Export nhiều apps
        if not args.apps:
            print("❌ Cần chỉ định --apps cho loại export 'apps'")
            return
        
        available_apps = get_available_apps()
        invalid_apps = [app for app in args.apps if app not in available_apps]
        
        if invalid_apps:
            print(f"❌ Các app không tồn tại: {', '.join(invalid_apps)}")
            print("Sử dụng --list-apps để xem danh sách apps có sẵn")
            return
        
        export_multiple_apps(args.apps, include_data, args.limit)


if __name__ == '__main__':
    main() 