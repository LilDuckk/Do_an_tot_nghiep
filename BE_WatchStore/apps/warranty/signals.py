from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from apps.orders.models.order_detail import OrderDetail
from apps.orders.models.order import Orders
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.services import WarrantyService

@receiver(post_save, sender=OrderDetail)
def create_warranty_on_order_complete(sender, instance, created, **kwargs):
    """Tự động tạo warranty khi order detail được tạo"""
    try:
        if created and instance.order and instance.order.status == 'delivered':
            # Kiểm tra xem warranty đã tồn tại chưa
            existing_warranty = Warranty.objects.filter(
                order_detail=instance,
                is_deleted=False
            ).first()
            
            if not existing_warranty:
                WarrantyService.create_warranty_from_order(instance)
                
    except Exception as e:
        print(f"Error creating warranty from order detail: {str(e)}")

@receiver(post_save, sender=Orders)
def create_warranty_on_order_status_change(sender, instance, **kwargs):
    """Tự động tạo warranty khi order status thay đổi thành 'delivered'"""
    try:
        if instance.status == 'delivered':
            # Lấy tất cả order details của order này
            order_details = instance.orderdetail_set.filter(is_deleted=False)
            
            for order_detail in order_details:
                # Kiểm tra xem warranty đã tồn tại chưa
                existing_warranty = Warranty.objects.filter(
                    order_detail=order_detail,
                    is_deleted=False
                ).first()
                
                if not existing_warranty:
                    WarrantyService.create_warranty_from_order(order_detail)
                    
    except Exception as e:
        print(f"Error creating warranty from order status change: {str(e)}")

@receiver(post_save, sender=Orders)
def handle_warranty_on_order_cancelled(sender, instance, **kwargs):
    """Xử lý warranty khi order bị hủy (cancelled)"""
    try:
        if instance.status == 'cancelled':
            # Lấy tất cả order details của order này
            order_details = instance.orderdetail_set.filter(is_deleted=False)
            
            for order_detail in order_details:
                # Tìm warranty liên quan
                warranties = Warranty.objects.filter(
                    order_detail=order_detail,
                    is_deleted=False
                )
                
                for warranty in warranties:
                    # Kiểm tra xem warranty có đang được sử dụng không
                    active_claims = WarrantyClaim.objects.filter(
                        warranty=warranty,
                        status__in=['PENDING', 'IN_PROGRESS'],
                        is_deleted=False
                    )
                    
                    if active_claims.exists():
                        # Nếu có claims đang xử lý, chỉ cập nhật status thành CANCELLED
                        warranty.status = 'CANCELLED'
                        warranty.notes = f"Warranty cancelled due to order cancellation. Order ID: {instance.id}"
                        warranty.updated_by = instance.updated_by
                        warranty.save()
                        print(f"Warranty {warranty.warranty_number} status changed to CANCELLED due to active claims")
                    else:
                        # Nếu không có claims đang xử lý, xóa mềm warranty
                        warranty.is_deleted = True
                        warranty.notes = f"Warranty deleted due to order cancellation. Order ID: {instance.id}"
                        warranty.updated_by = instance.updated_by
                        warranty.save()
                        print(f"Warranty {warranty.warranty_number} soft deleted due to order cancellation")
                    
    except Exception as e:
        print(f"Error handling warranty on order cancelled: {str(e)}")

@receiver(post_save, sender=Warranty)
def update_warranty_status(sender, instance, **kwargs):
    """Tự động cập nhật status của warranty dựa trên thời gian"""
    try:
        if instance.is_expired() and instance.status != 'EXPIRED':
            instance.status = 'EXPIRED'
            instance.save(update_fields=['status'])
            
    except Exception as e:
        print(f"Error updating warranty status: {str(e)}")

@receiver(post_save, sender=WarrantyClaim)
def update_warranty_on_claim(sender, instance, created, **kwargs):
    """Cập nhật warranty khi có claim mới"""
    try:
        if created and instance.warranty:
            # Cập nhật status của warranty thành CLAIMED
            warranty = instance.warranty
            warranty.status = 'CLAIMED'
            warranty.save(update_fields=['status'])
            
    except Exception as e:
        print(f"Error updating warranty on claim: {str(e)}")

@receiver(post_save, sender=WarrantyClaim)
def send_notification_on_claim(sender, instance, created, **kwargs):
    """Gửi thông báo khi có warranty claim mới"""
    try:
        if created:
            # TODO: Tích hợp với notification service
            print(f"New warranty claim created: {instance.claim_number}")
            
    except Exception as e:
        print(f"Error sending notification for warranty claim: {str(e)}")

@receiver(post_save, sender=WarrantyClaim)
def check_overdue_claims(sender, instance, **kwargs):
    """Kiểm tra claims quá hạn và gửi cảnh báo"""
    try:
        if instance.is_overdue() and instance.status in ['PENDING', 'IN_PROGRESS']:
            # TODO: Gửi cảnh báo cho manager/technician
            print(f"Warranty claim overdue: {instance.claim_number}")
            
    except Exception as e:
        print(f"Error checking overdue claims: {str(e)}")

@receiver(post_delete, sender=Warranty)
def cleanup_warranty_claims(sender, instance, **kwargs):
    """Dọn dẹp warranty claims khi warranty bị xóa"""
    try:
        # Xóa mềm tất cả claims liên quan
        WarrantyClaim.objects.filter(
            warranty=instance,
            is_deleted=False
        ).update(is_deleted=True)
        
    except Exception as e:
        print(f"Error cleaning up warranty claims: {str(e)}")

# Signal để tự động cập nhật warranty status hàng ngày
def update_expired_warranties():
    """Cập nhật tất cả warranty đã hết hạn"""
    try:
        today = timezone.now().date()
        expired_warranties = Warranty.objects.filter(
            warranty_end_date__lt=today,
            status='ACTIVE',
            is_deleted=False
        )
        
        for warranty in expired_warranties:
            warranty.status = 'EXPIRED'
            warranty.save(update_fields=['status'])
            
        print(f"Updated {expired_warranties.count()} expired warranties")
        
    except Exception as e:
        print(f"Error updating expired warranties: {str(e)}")

# Signal để kiểm tra claims quá hạn hàng ngày
def check_overdue_warranty_claims():
    """Kiểm tra tất cả claims quá hạn"""
    try:
        overdue_claims = []
        for claim in WarrantyClaim.objects.filter(
            status__in=['PENDING', 'IN_PROGRESS'],
            is_deleted=False
        ):
            if claim.is_overdue():
                overdue_claims.append(claim)
        
        if overdue_claims:
            print(f"Found {len(overdue_claims)} overdue warranty claims")
            # TODO: Gửi email cảnh báo cho manager
            
    except Exception as e:
        print(f"Error checking overdue warranty claims: {str(e)}") 