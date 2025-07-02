from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from apps.orders.models.order_detail import OrderDetail
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.services import WarrantyService

@receiver(post_save, sender=OrderDetail)
def create_warranty_on_order_complete(sender, instance, created, **kwargs):
    """Tự động tạo warranty khi order detail được tạo"""
    try:
        if created and instance.order and instance.order.status == 'completed':
            # Kiểm tra xem warranty đã tồn tại chưa
            existing_warranty = Warranty.objects.filter(
                order_detail=instance,
                is_deleted=False
            ).first()
            
            if not existing_warranty:
                WarrantyService.create_warranty_from_order(instance)
                
    except Exception as e:
        print(f"Error creating warranty from order detail: {str(e)}")

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