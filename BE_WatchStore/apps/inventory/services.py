from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.products.models.variant import ProductVariant
from apps.products.models.product import Product

class InventoryService:
    @staticmethod
    def create_inventory_for_product(product):
        """Tạo inventory cho tất cả variants của product"""
        try:
            for variant in product.variants.filter(is_active=True):
                InventoryService.create_inventory_for_variant(variant)
        except Exception as e:
            print(f"Error creating inventory for product {product.id}: {str(e)}")
    
    @staticmethod
    def create_inventory_for_variant(variant, store=None):
        """Tạo inventory cho variant (không tạo transaction ban đầu)"""
        try:
            # Tạo inventory cho tất cả stores nếu không chỉ định
            if not store:
                from apps.stores.models.store import Store
                stores = Store.objects.filter(is_active=True)
                for store in stores:
                    InventoryService.create_inventory_for_variant(variant, store)
                return
            
            # Kiểm tra xem inventory đã tồn tại chưa
            existing_inventory = Inventory.objects.filter(
                store=store,
                product_variant=variant,
                is_deleted=False
            ).first()
            
            if not existing_inventory:
                inventory = Inventory.objects.create(
                    store=store,
                    product_variant=variant,
                    quantity=0,
                    created_by=variant.created_by,
                    updated_by=variant.updated_by
                )
                
                # Không tạo transaction ban đầu - chỉ tạo khi có hoạt động thực tế
                return inventory
            
            return existing_inventory
            
        except Exception as e:
            print(f"Error creating inventory for variant {variant.sku}: {str(e)}")
    
    @staticmethod
    def update_inventory_quantity(inventory, quantity_change, transaction_type, reference_type, reference_id, note, user=None):
        """Cập nhật số lượng inventory và tạo transaction"""
        try:
            with transaction.atomic():
                old_quantity = inventory.quantity
                inventory.quantity += quantity_change
                
                # Kiểm tra số lượng không âm
                if inventory.quantity < 0:
                    raise ValidationError(f"Inventory quantity cannot be negative. Current: {old_quantity}, Change: {quantity_change}")
                
                inventory.updated_by = user
                inventory.save()
                
                # Chỉ tạo transaction khi có thay đổi số lượng thực tế
                if quantity_change != 0:
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type=transaction_type,
                        quantity=abs(quantity_change),
                        reference_type=reference_type,
                        reference_id=reference_id,
                        note=note,
                        created_by=user,
                        updated_by=user
                    )
                
                return inventory
                
        except Exception as e:
            raise ValidationError(f"Error updating inventory: {str(e)}")
    
    @staticmethod
    def check_stock_availability(product_variant, store, required_quantity):
        """Kiểm tra tồn kho có đủ không"""
        try:
            inventory = Inventory.objects.filter(
                store=store,
                product_variant=product_variant,
                is_deleted=False
            ).first()
            
            if not inventory:
                return False, 0, f"No inventory found for {product_variant.sku}"
            
            if inventory.quantity < required_quantity:
                return False, inventory.quantity, f"Insufficient stock. Required: {required_quantity}, Available: {inventory.quantity}"
            
            return True, inventory.quantity, "Stock available"
            
        except Exception as e:
            return False, 0, f"Error checking stock: {str(e)}"
    
    @staticmethod
    def get_low_stock_items(store=None, threshold_percentage=20):
        """Lấy danh sách sản phẩm tồn kho thấp"""
        try:
            queryset = Inventory.objects.filter(is_deleted=False)
            
            if store:
                queryset = queryset.filter(store=store)
            
            low_stock_items = []
            for inventory in queryset:
                if inventory.product_variant.stock_alert_threshold:
                    threshold = inventory.product_variant.stock_alert_threshold
                else:
                    # Tính threshold dựa trên percentage nếu không có alert threshold
                    threshold = max(1, int(inventory.quantity * threshold_percentage / 100))
                
                if inventory.quantity <= threshold:
                    low_stock_items.append({
                        'inventory': inventory,
                        'current_quantity': inventory.quantity,
                        'threshold': threshold,
                        'product_name': inventory.product_variant.product.name,
                        'variant_sku': inventory.product_variant.sku,
                        'store_name': inventory.store.name
                    })
            
            return low_stock_items
            
        except Exception as e:
            print(f"Error getting low stock items: {str(e)}")
            return []
    
    @staticmethod
    def get_inventory_history(product_variant, store, start_date=None, end_date=None):
        """Lấy lịch sử inventory cho variant"""
        try:
            from django.db.models import Sum
            
            inventory = Inventory.objects.filter(
                store=store,
                product_variant=product_variant,
                is_deleted=False
            ).first()
            
            if not inventory:
                return []
            
            queryset = InventoryTransaction.objects.filter(
                inventory=inventory,
                is_deleted=False
            )
            
            if start_date:
                queryset = queryset.filter(transaction_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(transaction_date__lte=end_date)
            
            history = queryset.order_by('transaction_date').values(
                'transaction_date',
                'transaction_type',
                'quantity',
                'reference_type',
                'reference_id',
                'note'
            )
            
            return list(history)
            
        except Exception as e:
            print(f"Error getting inventory history: {str(e)}")
            return []
    
    @staticmethod
    def get_inventory_statistics(store=None):
        """Lấy thống kê inventory"""
        try:
            from django.db.models import Count, Sum, Avg, Q
            
            queryset = Inventory.objects.filter(is_deleted=False)
            
            if store:
                queryset = queryset.filter(store=store)
            
            stats = queryset.aggregate(
                total_items=Count('id'),
                total_quantity=Sum('quantity'),
                avg_quantity=Avg('quantity'),
                zero_stock_items=Count('id', filter=Q(quantity=0)),
                low_stock_items=Count('id', filter=Q(quantity__lte=5))
            )
            
            # Tính tổng giá trị inventory
            total_value = 0
            for inventory in queryset:
                if inventory.product_variant:
                    total_value += inventory.quantity * inventory.product_variant.get_final_price()
            
            stats['total_value'] = total_value
            
            return stats
            
        except Exception as e:
            print(f"Error getting inventory statistics: {str(e)}")
            return {}
    
    @staticmethod
    def handle_stock_transfer(source_store, dest_store, product_variant, quantity, user=None, note=""):
        """Xử lý chuyển kho"""
        try:
            with transaction.atomic():
                # Kiểm tra tồn kho nguồn
                source_inventory = Inventory.objects.filter(
                    store=source_store,
                    product_variant=product_variant,
                    is_deleted=False
                ).first()
                
                if not source_inventory or source_inventory.quantity < quantity:
                    raise ValidationError(f"Insufficient stock at source store. Available: {source_inventory.quantity if source_inventory else 0}, Required: {quantity}")
                
                # Trừ kho nguồn
                InventoryService.update_inventory_quantity(
                    source_inventory,
                    -quantity,
                    'TRANSFER_OUT',
                    'stock_transfer',
                    source_store.id,
                    f"Stock transfer to {dest_store.name}: {note}",
                    user
                )
                
                # Cộng kho đích
                dest_inventory = Inventory.objects.filter(
                    store=dest_store,
                    product_variant=product_variant,
                    is_deleted=False
                ).first()
                
                if not dest_inventory:
                    dest_inventory = InventoryService.create_inventory_for_variant(product_variant, dest_store)
                
                InventoryService.update_inventory_quantity(
                    dest_inventory,
                    quantity,
                    'TRANSFER_IN',
                    'stock_transfer',
                    source_store.id,
                    f"Stock transfer from {source_store.name}: {note}",
                    user
                )
                
                return True
                
        except Exception as e:
            raise ValidationError(f"Error handling stock transfer: {str(e)}")
    
    @staticmethod
    def handle_stock_adjustment(inventory, new_quantity, reason, user=None):
        """Xử lý điều chỉnh tồn kho"""
        try:
            with transaction.atomic():
                old_quantity = inventory.quantity
                adjustment = new_quantity - old_quantity
                
                if adjustment != 0:
                    transaction_type = 'ADJUSTMENT_IN' if adjustment > 0 else 'ADJUSTMENT_OUT'
                    
                    InventoryService.update_inventory_quantity(
                        inventory,
                        adjustment,
                        transaction_type,
                        'stock_adjustment',
                        inventory.id,
                        f"Stock adjustment: {reason}. Old: {old_quantity}, New: {new_quantity}",
                        user
                    )
                
                return inventory
                
        except Exception as e:
            raise ValidationError(f"Error handling stock adjustment: {str(e)}") 