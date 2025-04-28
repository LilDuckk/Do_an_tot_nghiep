from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from .models.audit_log import AuditLog

@receiver(post_save)
def model_post_save(sender, instance, created, **kwargs):
    """
    Signal để lắng nghe sự kiện post_save
    """
    # Bỏ qua nếu là model AuditLog
    if sender == AuditLog:
        return
        
    # Lấy thông tin user và request từ middleware
    user = getattr(settings, 'AUDIT_LOG_USER', None)
    ip_address = getattr(settings, 'AUDIT_LOG_IP_ADDRESS', None)
    user_agent = getattr(settings, 'AUDIT_LOG_USER_AGENT', None)
    
    # Tạo audit log
    content_type = ContentType.objects.get_for_model(sender)
    
    if created:
        # Tạo mới
        AuditLog.objects.create(
            content_type=content_type,
            object_id=instance.pk,
            action='CREATE',
            new_values=instance.__dict__,
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )
    else:
        # Cập nhật
        # Lấy trạng thái cũ từ instance._state.fields_cache
        old_values = {}
        for field in instance._meta.fields:
            if field.name in instance._state.fields_cache:
                old_values[field.name] = instance._state.fields_cache[field.name]
        
        AuditLog.objects.create(
            content_type=content_type,
            object_id=instance.pk,
            action='UPDATE',
            old_values=old_values,
            new_values=instance.__dict__,
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )

@receiver(post_delete)
def model_post_delete(sender, instance, **kwargs):
    """
    Signal để lắng nghe sự kiện post_delete
    """
    # Bỏ qua nếu là model AuditLog
    if sender == AuditLog:
        return
        
    # Lấy thông tin user và request từ middleware
    user = getattr(settings, 'AUDIT_LOG_USER', None)
    ip_address = getattr(settings, 'AUDIT_LOG_IP_ADDRESS', None)
    user_agent = getattr(settings, 'AUDIT_LOG_USER_AGENT', None)
    
    # Tạo audit log
    content_type = ContentType.objects.get_for_model(sender)
    
    AuditLog.objects.create(
        content_type=content_type,
        object_id=instance.pk,
        action='DELETE',
        old_values=instance.__dict__,
        user=user,
        ip_address=ip_address,
        user_agent=user_agent
    )
