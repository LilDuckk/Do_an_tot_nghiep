from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from apps.core.models.audit_log import AuditLog
from apps.core.middleware import UserMiddleware

def get_request_ip():
    try:
        from django.http import HttpRequest
        request = HttpRequest()
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    except:
        return None

@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender._meta.app_label == 'core' and sender._meta.model_name == 'auditlog':
        return

    action = 'CREATE' if created else 'UPDATE'
    old_values = None
    new_values = None

    if not created:
        old_values = {
            field.name: getattr(instance, field.name)
            for field in instance._meta.fields
            if field.name not in ['created_at', 'updated_at']
        }

    new_values = {
        field.name: getattr(instance, field.name)
        for field in instance._meta.fields
        if field.name not in ['created_at', 'updated_at']
    }

    AuditLog.objects.create(
        action=action,
        model_name=f"{sender._meta.app_label}.{sender._meta.model_name}",
        object_id=str(instance.pk),
        old_values=old_values,
        new_values=new_values,
        user=UserMiddleware.get_current_user(),
        ip_address=get_request_ip(),
        action_date=timezone.now()
    )

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender._meta.app_label == 'core' and sender._meta.model_name == 'auditlog':
        return

    old_values = {
        field.name: getattr(instance, field.name)
        for field in instance._meta.fields
        if field.name not in ['created_at', 'updated_at']
    }

    AuditLog.objects.create(
        action='DELETE',
        model_name=f"{sender._meta.app_label}.{sender._meta.model_name}",
        object_id=str(instance.pk),
        old_values=old_values,
        new_values=None,
        user=UserMiddleware.get_current_user(),
        ip_address=get_request_ip(),
        action_date=timezone.now()
    ) 