from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.orders.models.order_detail import OrderDetail

class WarrantyService:
    @staticmethod
    def create_warranty_from_order(order_detail, user=None):
        """Tự động tạo warranty khi order hoàn thành"""
        try:
            product_variant = order_detail.product_variant
            warranty_period = product_variant.get_warranty_period()
            if not warranty_period:
                return None
            
            warranty = Warranty.create_from_order_detail(order_detail, user)
            
            # Tạo inventory transaction cho warranty
            if warranty:
                WarrantyService.create_warranty_inventory_transaction(warranty)
            
            return warranty
        except Exception as e:
            raise ValidationError(f"Error creating warranty: {str(e)}")
    
    @staticmethod
    def create_warranty_inventory_transaction(warranty):
        """Tạo inventory transaction cho warranty"""
        try:
            order_detail = warranty.order_detail
            store = order_detail.order.store
            product_variant = order_detail.product_variant
            
            # Tìm inventory record
            inventory = Inventory.objects.filter(
                store=store,
                product_variant=product_variant,
                is_deleted=False
            ).first()
            
            if inventory:
                # Tạo transaction để track warranty
                InventoryTransaction.objects.create(
                    inventory=inventory,
                    transaction_type='WARRANTY_CREATED',
                    quantity=0,  # Không thay đổi số lượng
                    reference_type='warranty',
                    reference_id=warranty.id,
                    note=f"Warranty created for {product_variant.product.name}",
                    created_by=warranty.created_by,
                    updated_by=warranty.created_by
                )
        except Exception as e:
            # Log error nhưng không fail warranty creation
            print(f"Error creating warranty inventory transaction: {str(e)}")
    
    @staticmethod
    def process_warranty_claim(warranty_claim, action, user=None, **kwargs):
        """Xử lý warranty claim"""
        try:
            if action == 'approve':
                warranty_claim.status = 'IN_PROGRESS'
                warranty_claim.technician = user
                warranty_claim.updated_by = user
                warranty_claim.save()
                
                # Tạo inventory transaction
                WarrantyService.handle_warranty_claim_inventory(warranty_claim)
                
            elif action == 'complete':
                warranty_claim.status = 'COMPLETED'
                warranty_claim.updated_by = user
                warranty_claim.save()
                
                # Cập nhật inventory nếu cần
                WarrantyService.handle_warranty_completion(warranty_claim)
                
            elif action == 'reject':
                warranty_claim.status = 'REJECTED'
                warranty_claim.updated_by = user
                warranty_claim.save()
                
                # Cập nhật warranty status
                warranty = warranty_claim.warranty
                warranty.status = 'ACTIVE'
                warranty.save()
            
            return warranty_claim
            
        except Exception as e:
            raise ValidationError(f"Error processing warranty claim: {str(e)}")
    
    @staticmethod
    def handle_warranty_claim_inventory(warranty_claim):
        """Xử lý inventory khi có warranty claim"""
        try:
            warranty = warranty_claim.warranty
            product_variant = warranty.order_detail.product_variant
            store = warranty.order_detail.order.store
            
            # Kiểm tra tồn kho sản phẩm thay thế
            inventory = Inventory.objects.filter(
                store=store,
                product_variant=product_variant,
                is_deleted=False
            ).first()
            
            if inventory and inventory.quantity > 0:
                # Trừ kho sản phẩm thay thế
                inventory.quantity -= 1
                inventory.updated_by = warranty_claim.updated_by
                inventory.save()
                
                # Tạo transaction
                InventoryTransaction.objects.create(
                    inventory=inventory,
                    transaction_type='OUT',
                    quantity=1,
                    reference_type='warranty_claim',
                    reference_id=warranty_claim.id,
                    note=f"Warranty claim: {warranty_claim.description}",
                    created_by=warranty_claim.created_by,
                    updated_by=warranty_claim.updated_by
                )
            else:
                # Tạo transaction để track shortage
                if inventory:
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='WARRANTY_SHORTAGE',
                        quantity=0,
                        reference_type='warranty_claim',
                        reference_id=warranty_claim.id,
                        note=f"Warranty claim shortage: {warranty_claim.description}",
                        created_by=warranty_claim.created_by,
                        updated_by=warranty_claim.updated_by
                    )
                    
        except Exception as e:
            print(f"Error handling warranty claim inventory: {str(e)}")
    
    @staticmethod
    def handle_warranty_completion(warranty_claim):
        """Xử lý khi hoàn thành warranty"""
        try:
            warranty = warranty_claim.warranty
            product_variant = warranty.order_detail.product_variant
            store = warranty.order_detail.order.store
            
            # Tìm inventory
            inventory = Inventory.objects.filter(
                store=store,
                product_variant=product_variant,
                is_deleted=False
            ).first()
            
            if inventory:
                # Cộng lại kho nếu sửa chữa thành công
                inventory.quantity += 1
                inventory.updated_by = warranty_claim.updated_by
                inventory.save()
                
                # Tạo transaction
                InventoryTransaction.objects.create(
                    inventory=inventory,
                    transaction_type='IN',
                    quantity=1,
                    reference_type='warranty_completed',
                    reference_id=warranty_claim.id,
                    note=f"Warranty completed: {warranty_claim.resolution}",
                    created_by=warranty_claim.created_by,
                    updated_by=warranty_claim.updated_by
                )
                
        except Exception as e:
            print(f"Error handling warranty completion: {str(e)}")

    @staticmethod
    def get_warranty_statistics(store_id=None, start_date=None, end_date=None):
        """Lấy thống kê warranty"""
        try:
            from django.db.models import Count, Q
            from django.utils import timezone
            
            # Base queryset
            queryset = Warranty.objects.filter(is_deleted=False)
            
            # Filter theo store nếu có
            if store_id:
                queryset = queryset.filter(
                    order_detail__order__store_id=store_id
                )
            
            # Filter theo date range nếu có
            if start_date:
                queryset = queryset.filter(warranty_start_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(warranty_start_date__lte=end_date)
            
            # Thống kê theo status
            status_stats = queryset.values('status').annotate(
                count=Count('id')
            )
            
            # Thống kê tổng quan
            total_warranties = queryset.count()
            active_warranties = queryset.filter(status='ACTIVE').count()
            expired_warranties = queryset.filter(status='EXPIRED').count()
            claimed_warranties = queryset.filter(status='CLAIMED').count()
            cancelled_warranties = queryset.filter(status='CANCELLED').count()
            
            # Thống kê theo tháng (6 tháng gần nhất)
            from datetime import datetime, timedelta
            today = timezone.now().date()
            warranty_by_month = {}
            
            for i in range(6):
                month_date = today - timedelta(days=30*i)
                month_key = month_date.strftime('%Y-%m')
                month_count = queryset.filter(
                    warranty_start_date__year=month_date.year,
                    warranty_start_date__month=month_date.month
                ).count()
                warranty_by_month[month_key] = month_count
            
            # Top products với warranty
            top_products = queryset.values(
                'order_detail__product_variant__product__id',
                'order_detail__product_variant__product__name'
            ).annotate(
                warranty_count=Count('id')
            ).order_by('-warranty_count')[:10]
            
            return {
                'total_warranties': total_warranties,
                'active_warranties': active_warranties,
                'expired_warranties': expired_warranties,
                'claimed_warranties': claimed_warranties,
                'cancelled_warranties': cancelled_warranties,
                'warranty_by_status': {
                    item['status']: item['count'] for item in status_stats
                },
                'warranty_by_month': warranty_by_month,
                'top_products_with_warranty': [
                    {
                        'product_id': item['order_detail__product_variant__product__id'],
                        'product_name': item['order_detail__product_variant__product__name'],
                        'warranty_count': item['warranty_count']
                    }
                    for item in top_products
                ]
            }
            
        except Exception as e:
            print(f"Error getting warranty statistics: {str(e)}")
            return {
                'total_warranties': 0,
                'active_warranties': 0,
                'expired_warranties': 0,
                'claimed_warranties': 0,
                'cancelled_warranties': 0,
                'warranty_by_status': {},
                'warranty_by_month': {},
                'top_products_with_warranty': []
            } 