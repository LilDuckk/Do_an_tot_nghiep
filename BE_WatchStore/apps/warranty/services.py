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
            product = order_detail.product_variant.product
            if not product.warranty_period:
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
    def get_warranty_statistics():
        """Lấy thống kê warranty"""
        from django.db.models import Count, Q
        
        total_warranties = Warranty.objects.filter(is_deleted=False).count()
        active_warranties = Warranty.objects.filter(
            is_deleted=False,
            status='ACTIVE'
        ).count()
        expired_warranties = Warranty.objects.filter(
            is_deleted=False,
            status='EXPIRED'
        ).count()
        
        total_claims = WarrantyClaim.objects.filter(is_deleted=False).count()
        pending_claims = WarrantyClaim.objects.filter(
            is_deleted=False,
            status='PENDING'
        ).count()
        completed_claims = WarrantyClaim.objects.filter(
            is_deleted=False,
            status='COMPLETED'
        ).count()
        
        return {
            'total_warranties': total_warranties,
            'active_warranties': active_warranties,
            'expired_warranties': expired_warranties,
            'total_claims': total_claims,
            'pending_claims': pending_claims,
            'completed_claims': completed_claims,
        } 