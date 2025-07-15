#!/usr/bin/env python
"""
Script test để kiểm tra các Django management commands cho models
"""

import os
import sys
import django
from pathlib import Path

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from django.test.utils import override_settings
from io import StringIO


def test_list_models():
    """Test command list_models"""
    print("=== TEST: list_models ===")
    
    # Test liệt kê tất cả models
    out = StringIO()
    call_command('list_models', stdout=out)
    output = out.getvalue()
    print("✅ Liệt kê tất cả models:")
    print(output[:500] + "..." if len(output) > 500 else output)
    
    # Test liệt kê models của app products
    out = StringIO()
    call_command('list_models', '--app', 'products', stdout=out)
    output = out.getvalue()
    print("\n✅ Liệt kê models của app products:")
    print(output)
    
    # Test liệt kê với chi tiết
    out = StringIO()
    call_command('list_models', '--app', 'products', '--detail', stdout=out)
    output = out.getvalue()
    print("\n✅ Liệt kê với chi tiết:")
    print(output[:1000] + "..." if len(output) > 1000 else output)


def test_export_models():
    """Test command export_models"""
    print("\n=== TEST: export_models ===")
    
    # Test export tất cả models
    output_file = 'test_models_export.json'
    try:
        call_command('export_models', '--output', output_file)
        print(f"✅ Đã export models vào file: {output_file}")
        
        # Kiểm tra file đã được tạo
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            print(f"   File size: {file_size} bytes")
            
            # Đọc và hiển thị một phần nội dung
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"   Preview: {content[:200]}...")
        else:
            print("❌ File không được tạo")
            
    except Exception as e:
        print(f"❌ Lỗi khi export: {e}")
    
    # Test export chỉ app products
    output_file_app = 'test_products_export.json'
    try:
        call_command('export_models', '--app', 'products', '--output', output_file_app)
        print(f"✅ Đã export models của app products vào file: {output_file_app}")
    except Exception as e:
        print(f"❌ Lỗi khi export app products: {e}")


def test_generate_models():
    """Test command generate_models"""
    print("\n=== TEST: generate_models ===")
    
    # Test generate tất cả models
    output_file = 'test_generated_models.py'
    try:
        call_command('generate_models', '--output', output_file)
        print(f"✅ Đã generate models vào file: {output_file}")
        
        # Kiểm tra file đã được tạo
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            print(f"   File size: {file_size} bytes")
            
            # Đọc và hiển thị một phần nội dung
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"   Preview: {content[:300]}...")
        else:
            print("❌ File không được tạo")
            
    except Exception as e:
        print(f"❌ Lỗi khi generate: {e}")
    
    # Test generate chỉ app products với Meta
    output_file_app = 'test_products_generated.py'
    try:
        call_command('generate_models', '--app', 'products', '--include-meta', '--output', output_file_app)
        print(f"✅ Đã generate models của app products với Meta vào file: {output_file_app}")
    except Exception as e:
        print(f"❌ Lỗi khi generate app products: {e}")


def cleanup_test_files():
    """Xóa các file test đã tạo"""
    test_files = [
        'test_models_export.json',
        'test_products_export.json', 
        'test_generated_models.py',
        'test_products_generated.py'
    ]
    
    print("\n=== CLEANUP ===")
    for file in test_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"🗑️  Đã xóa: {file}")


def main():
    """Chạy tất cả tests"""
    print("🚀 BẮT ĐẦU TEST CÁC MODEL COMMANDS")
    print("=" * 50)
    
    try:
        # Test các commands
        test_list_models()
        test_export_models()
        test_generate_models()
        
        print("\n" + "=" * 50)
        print("✅ TẤT CẢ TESTS HOÀN THÀNH THÀNH CÔNG!")
        
    except Exception as e:
        print(f"\n❌ CÓ LỖI XẢY RA: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        cleanup_test_files()


if __name__ == '__main__':
    main() 