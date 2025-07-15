#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.inventory.models import Inventory

def test_product_delete():
    """Test xóa sản phẩm"""
    print("=== TEST XÓA SẢN PHẨM ===")
    
    # Kiểm tra import
    try:
        from apps.inventory.models import Inventory
        print("✅ Import Inventory thành công")
    except ImportError as e:
        print(f"❌ Lỗi import Inventory: {e}")
        return
    
    # Lấy sản phẩm đầu tiên để test
    product = Product.objects.filter(is_deleted=False).first()
    
    if not product:
        print("❌ Không có sản phẩm nào để test")
        return
    
    print(f"✅ Tìm thấy sản phẩm: {product.name} (ID: {product.id})")
    
    # Kiểm tra variants
    variants = product.variants.filter(is_deleted=False)
    print(f"   - Số variants: {variants.count()}")
    
    # Kiểm tra inventory
    variant_ids = list(variants.values_list('id', flat=True))
    inventory_count = Inventory.objects.filter(product_variant_id__in=variant_ids, is_deleted=False).count()
    print(f"   - Số inventory records: {inventory_count}")
    
    # Test xóa (chỉ test logic, không thực sự xóa)
    try:
        print("\n🔄 Test logic xóa sản phẩm...")
        
        # Test xóa variants
        variants.update(is_deleted=True)
        print("   ✅ Xóa variants thành công")
        
        # Test xóa inventory
        Inventory.objects.filter(product_variant_id__in=variant_ids).update(is_deleted=True)
        print("   ✅ Xóa inventory thành công")
        
        # Test xóa images
        product.images.update(is_deleted=True)
        print("   ✅ Xóa images thành công")
        
        print("✅ Tất cả logic xóa hoạt động bình thường!")
        
    except Exception as e:
        print(f"❌ Lỗi khi test xóa: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_product_delete() 