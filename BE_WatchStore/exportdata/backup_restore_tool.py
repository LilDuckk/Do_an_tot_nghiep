#!/usr/bin/env python
"""
Tool backup và restore database với giao diện tương tác
Sử dụng: python exportdata/backup_restore_tool.py
"""

import os
import sys
import django
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from django.conf import settings


class DatabaseBackupRestore:
    def __init__(self):
        self.backup_dir = BASE_DIR / 'exportdata' / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
    def backup_database(self, include_data=True, limit=1000):
        """Backup toàn bộ database"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'complete_backup_{timestamp}.json'
        filepath = self.backup_dir / filename
        
        print(f"🚀 Bắt đầu backup database...")
        print(f"📁 File output: {filepath}")
        
        try:
            # Export tất cả bảng với dữ liệu
            call_command(
                'export_all_tables',
                output=str(filepath),
                include_data=include_data,
                limit=limit
            )
            
            # Kiểm tra file đã tạo
            if filepath.exists():
                file_size = filepath.stat().st_size / (1024 * 1024)  # MB
                print(f"✅ Backup hoàn thành!")
                print(f"📏 Kích thước: {file_size:.2f} MB")
                print(f"📁 Đường dẫn: {filepath.absolute()}")
                return str(filepath)
            else:
                print(f"❌ Lỗi: File không được tạo")
                return None
            
        except Exception as e:
            print(f"❌ Lỗi backup: {e}")
            return None
    
    def backup_app_data(self, app_name, include_data=True, limit=1000):
        """Backup dữ liệu của một app cụ thể"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{app_name}_backup_{timestamp}.json'
        filepath = self.backup_dir / filename
        
        print(f"🚀 Backup app: {app_name}")
        print(f"📁 File output: {filepath}")
        
        try:
            call_command(
                'export_models',
                app=app_name,
                output=str(filepath),
                include_data=include_data,
                limit=limit
            )
            
            # Kiểm tra file đã tạo
            if filepath.exists():
                file_size = filepath.stat().st_size / (1024 * 1024)  # MB
                print(f"✅ Backup app {app_name} hoàn thành!")
                print(f"📏 Kích thước: {file_size:.2f} MB")
                print(f"📁 Đường dẫn: {filepath.absolute()}")
                return str(filepath)
            else:
                print(f"❌ Lỗi: File không được tạo")
                return None
            
        except Exception as e:
            print(f"❌ Lỗi backup app {app_name}: {e}")
            return None
    
    def backup_multiple_apps(self, apps_list, include_data=True, limit=1000):
        """Backup nhiều app cùng lúc"""
        print(f"🚀 Backup nhiều apps: {', '.join(apps_list)}")
        
        results = []
        for app_name in apps_list:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'{app_name}_backup_{timestamp}.json'
            filepath = self.backup_dir / filename
            
            success = self.backup_app_data(app_name, include_data, limit)
            results.append({
                'app': app_name,
                'file': str(filepath) if success else None,
                'success': success is not None
            })
        
        # Thống kê
        print("\n📊 THỐNG KÊ BACKUP:")
        successful = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        
        print(f"✅ Thành công: {len(successful)}/{len(results)}")
        print(f"❌ Thất bại: {len(failed)}/{len(results)}")
        
        if failed:
            print("\n❌ Apps thất bại:")
            for result in failed:
                print(f"  - {result['app']}")
        
        return results
    
    def restore_database(self, backup_file, clear_existing=False, dry_run=False):
        """Restore database từ file backup"""
        if not os.path.exists(backup_file):
            print(f"❌ File backup không tồn tại: {backup_file}")
            return False
        
        print(f"🚀 Bắt đầu restore database...")
        print(f"📁 File input: {backup_file}")
        
        if dry_run:
            print("🔍 DRY RUN MODE - Không thực sự restore")
        
        try:
            # Import script path
            import_script = BASE_DIR / 'exportdata' / 'import_database_data.py'
            
            # Build command
            cmd = [sys.executable, str(import_script), '--input', backup_file]
            if clear_existing:
                cmd.append('--clear-existing')
            if dry_run:
                cmd.append('--dry-run')
            
            # Execute command
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            # Print output
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print("❌ Lỗi:", result.stderr)
            
            if result.returncode == 0:
                if not dry_run:
                    print(f"✅ Restore hoàn thành!")
                else:
                    print(f"🔍 DRY RUN hoàn thành!")
                return True
            else:
                print(f"❌ Restore thất bại!")
                return False
            
        except Exception as e:
            print(f"❌ Lỗi restore: {e}")
            return False
    
    def list_backups(self):
        """Liệt kê các file backup có sẵn"""
        print("📋 Danh sách file backup:")
        print("=" * 60)
        
        backup_files = list(self.backup_dir.glob('*.json'))
        if not backup_files:
            print("Không có file backup nào")
            return []
        
        backup_list = []
        for i, file in enumerate(sorted(backup_files, key=lambda x: x.stat().st_mtime, reverse=True), 1):
            stat = file.stat()
            size_mb = stat.st_size / (1024 * 1024)
            modified = datetime.fromtimestamp(stat.st_mtime)
            
            print(f"{i:2d}. {file.name}")
            print(f"    📅 {modified.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"    📏 {size_mb:.2f} MB")
            print(f"    📁 {file.absolute()}")
            print()
            
            backup_list.append({
                'index': i,
                'name': file.name,
                'path': str(file.absolute()),
                'size_mb': size_mb,
                'modified': modified
            })
        
        return backup_list
    
    def get_available_apps(self):
        """Lấy danh sách các app có sẵn"""
        from django.apps import apps
        return [app.label for app in apps.get_app_configs() if not app.label.startswith('django')]


def main():
    """Hàm chính"""
    backup_restore = DatabaseBackupRestore()
    
    print("🔄 DATABASE BACKUP & RESTORE TOOL")
    print("=" * 60)
    
    while True:
        print("\n📋 Chọn hành động:")
        print("1. 🔄 Backup toàn bộ database")
        print("2. 📦 Backup app cụ thể")
        print("3. 📚 Backup nhiều apps")
        print("4. ⬇️ Restore database")
        print("5. 📋 Liệt kê file backup")
        print("6. 📱 Liệt kê apps có sẵn")
        print("7. 🚪 Thoát")
        
        choice = input("\nNhập lựa chọn (1-7): ").strip()
        
        if choice == '1':
            # Backup toàn bộ database
            print("\n🔄 BACKUP TOÀN BỘ DATABASE")
            print("-" * 40)
            
            include_data = input("Bao gồm dữ liệu? (y/n, mặc định y): ").strip().lower() != 'n'
            limit = input("Giới hạn records mỗi bảng (mặc định 1000): ").strip()
            limit = int(limit) if limit.isdigit() else 1000
            
            backup_restore.backup_database(include_data=include_data, limit=limit)
            
        elif choice == '2':
            # Backup app cụ thể
            print("\n📦 BACKUP APP CỤ THỂ")
            print("-" * 40)
            
            available_apps = backup_restore.get_available_apps()
            print("📱 Apps có sẵn:")
            for i, app in enumerate(available_apps, 1):
                print(f"  {i:2d}. {app}")
            
            app_name = input("\nNhập tên app: ").strip()
            if app_name and app_name in available_apps:
                include_data = input("Bao gồm dữ liệu? (y/n, mặc định y): ").strip().lower() != 'n'
                limit = input("Giới hạn records mỗi bảng (mặc định 1000): ").strip()
                limit = int(limit) if limit.isdigit() else 1000
                
                backup_restore.backup_app_data(app_name, include_data=include_data, limit=limit)
            else:
                print("❌ Tên app không hợp lệ")
                
        elif choice == '3':
            # Backup nhiều apps
            print("\n📚 BACKUP NHIỀU APPS")
            print("-" * 40)
            
            available_apps = backup_restore.get_available_apps()
            print("📱 Apps có sẵn:")
            for i, app in enumerate(available_apps, 1):
                print(f"  {i:2d}. {app}")
            
            apps_input = input("\nNhập tên apps (cách nhau bởi dấu phẩy): ").strip()
            if apps_input:
                apps_list = [app.strip() for app in apps_input.split(',')]
                valid_apps = [app for app in apps_list if app in available_apps]
                
                if valid_apps:
                    include_data = input("Bao gồm dữ liệu? (y/n, mặc định y): ").strip().lower() != 'n'
                    limit = input("Giới hạn records mỗi bảng (mặc định 1000): ").strip()
                    limit = int(limit) if limit.isdigit() else 1000
                    
                    backup_restore.backup_multiple_apps(valid_apps, include_data=include_data, limit=limit)
                else:
                    print("❌ Không có app hợp lệ nào được chọn")
            else:
                print("❌ Chưa nhập tên apps")
                
        elif choice == '4':
            # Restore database
            print("\n⬇️ RESTORE DATABASE")
            print("-" * 40)
            
            backup_list = backup_restore.list_backups()
            if not backup_list:
                continue
            
            try:
                backup_choice = input("\nChọn file backup (số thứ tự): ").strip()
                backup_index = int(backup_choice) - 1
                
                if 0 <= backup_index < len(backup_list):
                    selected_backup = backup_list[backup_index]
                    backup_file = selected_backup['path']
                    
                    print(f"\n📁 File được chọn: {selected_backup['name']}")
                    
                    clear_existing = input("Xóa dữ liệu cũ? (y/n, mặc định n): ").strip().lower() == 'y'
                    dry_run = input("Dry run (chỉ xem)? (y/n, mặc định n): ").strip().lower() == 'y'
                    
                    backup_restore.restore_database(backup_file, clear_existing=clear_existing, dry_run=dry_run)
                else:
                    print("❌ Số thứ tự không hợp lệ")
            except ValueError:
                print("❌ Vui lòng nhập số hợp lệ")
                
        elif choice == '5':
            # Liệt kê file backup
            backup_restore.list_backups()
            
        elif choice == '6':
            # Liệt kê apps có sẵn
            print("\n📱 DANH SÁCH APPS CÓ SẴN")
            print("-" * 40)
            
            available_apps = backup_restore.get_available_apps()
            for i, app in enumerate(available_apps, 1):
                print(f"  {i:2d}. {app}")
            
        elif choice == '7':
            print("👋 Tạm biệt!")
            break
            
        else:
            print("❌ Lựa chọn không hợp lệ")


if __name__ == '__main__':
    main() 