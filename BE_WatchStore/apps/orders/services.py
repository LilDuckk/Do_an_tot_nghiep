from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from decimal import Decimal

class ReturnOrderService:
    @staticmethod
    def process_return_order(return_order, action, user=None, **kwargs):
        """Xử lý return order"""
        try:
            with transaction.atomic():
                if action == 'approve':
                    return_order.approve_return(user, **kwargs)
                    # Cập nhật inventory
                    ReturnOrderService.handle_return_approval(return_order)
                    
                elif action == 'reject':
                    return_order.reject_return(user, kwargs.get('rejection_reason', ''))
                    
                elif action == 'complete':
                    return_order.complete_return(user)
                    # Hoàn tiền (có thể tích hợp với payment service sau)
                    ReturnOrderService.process_refund(return_order)
                
                return return_order
                
        except Exception as e:
            raise ValidationError(f"Error processing return order: {str(e)}")
    
    @staticmethod
    def validate_return_eligibility(order, return_items):
        """Kiểm tra điều kiện trả hàng"""
        try:
            # Kiểm tra thời gian (30 ngày)
            if order.order_date:
                days_since_order = (timezone.now() - order.order_date).days
                if days_since_order > 30:
                    return False, "Return period expired (must be within 30 days)"
            
            # Kiểm tra trạng thái order
            if order.status not in ['completed', 'delivered']:
                return False, "Order not eligible for return (must be completed or delivered)"
            
            # Kiểm tra số lượng trả
            for item in return_items:
                order_detail = item.get('order_detail')
                if not order_detail:
                    return False, f"Order detail not found for item"
                
                if item['quantity'] > order_detail.quantity:
                    return False, f"Return quantity ({item['quantity']}) exceeds order quantity ({order_detail.quantity}) for item {order_detail.product_variant.sku}"
                
                if item['quantity'] <= 0:
                    return False, f"Return quantity must be greater than 0 for item {order_detail.product_variant.sku}"
            
            return True, "Eligible for return"
            
        except Exception as e:
            return False, f"Error validating return eligibility: {str(e)}"
    
    @staticmethod
    def handle_return_approval(return_order):
        """Xử lý inventory khi duyệt trả hàng"""
        try:
            # Xác định store để cập nhật inventory
            # Nếu trả hàng ở cửa hàng khác, chỉ cập nhật inventory của cửa hàng gốc (nơi mua)
            # Nếu trả hàng ở cửa hàng gốc, cập nhật inventory của cửa hàng đó
            target_store = return_order.order.store  # Luôn cập nhật inventory của cửa hàng gốc
            
            for return_detail in return_order.returnorderdetail_set.all():
                if not return_detail.order_detail:
                    continue
                
                inventory = Inventory.objects.filter(
                    store=target_store,
                    product_variant=return_detail.product_variant,
                    is_deleted=False
                ).first()
                
                # Lấy unit_price từ order_detail
                unit_price = return_detail.order_detail.unit_price
                
                if inventory:
                    # Cộng lại kho của cửa hàng gốc
                    inventory.quantity += return_detail.quantity
                    inventory.updated_by = return_order.updated_by
                    inventory.save()
                    
                    # Tạo transaction
                    transaction_note = f"Return approved: {return_detail.reason or 'Customer return'}"
                    if return_order.return_store != return_order.order.store:
                        transaction_note += f" (Returned at {return_order.return_store.name})"
                    
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='IN',
                        quantity=return_detail.quantity,
                        unit_price=unit_price,
                        reference_type='return_order',
                        reference_id=return_order.id,
                        note=transaction_note,
                        created_by=return_order.created_by,
                        updated_by=return_order.updated_by
                    )
                else:
                    # Tạo inventory record mới nếu chưa có
                    inventory = Inventory.objects.create(
                        store=target_store,
                        product_variant=return_detail.product_variant,
                        quantity=return_detail.quantity,
                        created_by=return_order.created_by,
                        updated_by=return_order.updated_by
                    )
                    
                    # Tạo transaction
                    transaction_note = f"Return approved - new inventory: {return_detail.reason or 'Customer return'}"
                    if return_order.return_store != return_order.order.store:
                        transaction_note += f" (Returned at {return_order.return_store.name})"
                    
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='IN',
                        quantity=return_detail.quantity,
                        unit_price=unit_price,
                        reference_type='return_order_new',
                        reference_id=return_order.id,
                        note=transaction_note,
                        created_by=return_order.created_by,
                        updated_by=return_order.updated_by
                    )
                    
        except Exception as e:
            print(f"Error handling return approval: {str(e)}")
            raise ValidationError(f"Error updating inventory for return: {str(e)}")
    
    @staticmethod
    def process_refund(return_order):
        """Xử lý hoàn tiền (placeholder cho payment service)"""
        try:
            # Cập nhật refund status
            return_order.refund_status = 'PROCESSING'
            return_order.save()
            
            # TODO: Tích hợp với payment service thực tế
            # PaymentService.process_refund(return_order.refund_amount, return_order.refund_method)
            
            # Tạm thời set thành completed
            return_order.refund_status = 'COMPLETED'
            return_order.save()
            
            return True
            
        except Exception as e:
            return_order.refund_status = 'FAILED'
            return_order.save()
            print(f"Error processing refund: {str(e)}")
            return False
    
    @staticmethod
    def create_return_order_from_order(order, customer, return_items, reason, user=None, return_store=None):
        """Tạo return order từ order"""
        try:
            with transaction.atomic():
                # Validate eligibility
                is_eligible, message = ReturnOrderService.validate_return_eligibility(order, return_items)
                if not is_eligible:
                    raise ValidationError(message)
                
                # Tạo return order
                return_order = ReturnOrder.create_from_order(
                    order, customer, reason, user, return_store=return_store
                )
                
                # Tạo return order details
                for item in return_items:
                    ReturnOrderDetail.objects.create(
                        return_order=return_order,
                        order_detail=item['order_detail'],
                        product_variant=item['order_detail'].product_variant,
                        quantity=item['quantity'],
                        reason=item.get('reason', ''),
                        condition=item.get('condition', 'USED'),
                        created_by=user,
                        updated_by=user
                    )
                
                return return_order
                
        except Exception as e:
            raise ValidationError(f"Error creating return order: {str(e)}")
    
    @staticmethod
    def get_return_statistics():
        """Lấy thống kê return orders"""
        from django.db.models import Count, Sum
        
        total_returns = ReturnOrder.objects.filter(is_deleted=False).count()
        pending_returns = ReturnOrder.objects.filter(
            is_deleted=False,
            status='PENDING'
        ).count()
        approved_returns = ReturnOrder.objects.filter(
            is_deleted=False,
            status='APPROVED'
        ).count()
        completed_returns = ReturnOrder.objects.filter(
            is_deleted=False,
            status='COMPLETED'
        ).count()
        
        total_refund_amount = ReturnOrder.objects.filter(
            is_deleted=False,
            status='COMPLETED'
        ).aggregate(total=Sum('refund_amount'))['total'] or 0
        
        return {
            'total_returns': total_returns,
            'pending_returns': pending_returns,
            'approved_returns': approved_returns,
            'completed_returns': completed_returns,
            'total_refund_amount': total_refund_amount,
        } 