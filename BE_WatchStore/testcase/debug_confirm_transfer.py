#!/usr/bin/env python3
"""
Debug script để kiểm tra lỗi confirm_transfer API
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_imports():
    """Test các import cần thiết"""
    print("=== TEST IMPORTS ===")
    
    try:
        from apps.inventory.models.stock_transfer import StockTransfer
        print("✅ StockTransfer model imported successfully")
    except Exception as e:
        print(f"❌ Error importing StockTransfer: {e}")
        return False
    
    try:
        from apps.inventory.models.stock_transfer import StockTransferDetail
        print("✅ StockTransferDetail model imported successfully")
    except Exception as e:
        print(f"❌ Error importing StockTransferDetail: {e}")
        return False
    
    try:
        from apps.inventory.models.inventory import Inventory
        print("✅ Inventory model imported successfully")
    except Exception as e:
        print(f"❌ Error importing Inventory: {e}")
        return False
    
    try:
        from apps.inventory.models.inventory_transaction import InventoryTransaction
        print("✅ InventoryTransaction model imported successfully")
    except Exception as e:
        print(f"❌ Error importing InventoryTransaction: {e}")
        return False
    
    try:
        from apps.inventory.views.stock_transfer_view import StockTransferViewSet
        print("✅ StockTransferViewSet imported successfully")
    except Exception as e:
        print(f"❌ Error importing StockTransferViewSet: {e}")
        return False
    
    return True

def test_stock_transfer_data():
    """Test dữ liệu stock transfer"""
    print("\n=== TEST STOCK TRANSFER DATA ===")
    
    try:
        from apps.inventory.models.stock_transfer import StockTransfer
        
        # Kiểm tra stock transfer có tồn tại không
        stock_transfers = StockTransfer.objects.all()
        print(f"✅ Total stock transfers: {stock_transfers.count()}")
        
        # Kiểm tra stock transfer ID 2
        try:
            st = StockTransfer.objects.get(id=2)
            print(f"✅ Stock transfer ID 2 found: {st}")
            print(f"   - Status: {st.status}")
            print(f"   - Source store: {st.source_store}")
            print(f"   - Destination store: {st.destination_store}")
            
            # Kiểm tra details
            details = st.stocktransferdetail_set.all()
            print(f"   - Details count: {details.count()}")
            
            for detail in details:
                print(f"     * Product: {detail.product_variant.product.name if detail.product_variant.product else 'N/A'}")
                print(f"       SKU: {detail.product_variant.sku}")
                print(f"       Quantity: {detail.quantity}")
                print(f"       Received: {detail.received_quantity}")
                
        except StockTransfer.DoesNotExist:
            print("❌ Stock transfer ID 2 does not exist")
            return False
        
    except Exception as e:
        print(f"❌ Error testing stock transfer data: {e}")
        return False
    
    return True

def test_inventory_data():
    """Test dữ liệu inventory"""
    print("\n=== TEST INVENTORY DATA ===")
    
    try:
        from apps.inventory.models.stock_transfer import StockTransfer
        from apps.inventory.models.inventory import Inventory
        
        st = StockTransfer.objects.get(id=2)
        
        if st.source_store:
            source_inventories = Inventory.objects.filter(store=st.source_store)
            print(f"✅ Source store inventories: {source_inventories.count()}")
            
            for inv in source_inventories:
                print(f"   - Product: {inv.product_variant.product.name if inv.product_variant.product else 'N/A'}")
                print(f"     SKU: {inv.product_variant.sku}")
                print(f"     Quantity: {inv.quantity}")
        
        if st.destination_store:
            dest_inventories = Inventory.objects.filter(store=st.destination_store)
            print(f"✅ Destination store inventories: {dest_inventories.count()}")
            
            for inv in dest_inventories:
                print(f"   - Product: {inv.product_variant.product.name if inv.product_variant.product else 'N/A'}")
                print(f"     SKU: {inv.product_variant.sku}")
                print(f"     Quantity: {inv.quantity}")
        
    except Exception as e:
        print(f"❌ Error testing inventory data: {e}")
        return False
    
    return True

def test_confirm_transfer_logic():
    """Test logic confirm transfer"""
    print("\n=== TEST CONFIRM TRANSFER LOGIC ===")
    
    try:
        from apps.inventory.models.stock_transfer import StockTransfer, StockTransferDetail
        from apps.inventory.models.inventory import Inventory
        
        st = StockTransfer.objects.get(id=2)
        
        # Kiểm tra trạng thái
        if st.status == 'completed':
            print("❌ Stock transfer already completed")
            return False
        
        if st.status == 'cancelled':
            print("❌ Stock transfer is cancelled")
            return False
        
        # Kiểm tra tồn kho nguồn
        insufficient_items = []
        for detail in st.stocktransferdetail_set.all():
            source_inventory = Inventory.objects.filter(
                store=st.source_store,
                product_variant=detail.product_variant
            ).first()
            
            if not source_inventory:
                insufficient_items.append({
                    'product': detail.product_variant.product.name if detail.product_variant.product else 'N/A',
                    'required': detail.quantity,
                    'available': 0,
                    'reason': 'No inventory record'
                })
            elif source_inventory.quantity < detail.quantity:
                insufficient_items.append({
                    'product': detail.product_variant.product.name if detail.product_variant.product else 'N/A',
                    'required': detail.quantity,
                    'available': source_inventory.quantity,
                    'reason': 'Insufficient stock'
                })
        
        if insufficient_items:
            print("❌ Insufficient stock found:")
            for item in insufficient_items:
                print(f"   - {item['product']}: Required {item['required']}, Available {item['available']} ({item['reason']})")
            return False
        else:
            print("✅ All items have sufficient stock")
        
    except Exception as e:
        print(f"❌ Error testing confirm transfer logic: {e}")
        return False
    
    return True

def main():
    """Chạy tất cả debug tests"""
    print("CONFIRM TRANSFER DEBUG")
    print("=" * 50)
    
    # Chạy các tests
    if not test_imports():
        print("\n❌ Import tests failed")
        return
    
    if not test_stock_transfer_data():
        print("\n❌ Stock transfer data tests failed")
        return
    
    if not test_inventory_data():
        print("\n❌ Inventory data tests failed")
        return
    
    if not test_confirm_transfer_logic():
        print("\n❌ Confirm transfer logic tests failed")
        return
    
    print("\n" + "=" * 50)
    print("✅ ALL TESTS PASSED - Confirm transfer should work")

if __name__ == "__main__":
    main() 