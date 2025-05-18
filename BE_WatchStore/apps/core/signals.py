from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.db.utils import ProgrammingError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models

import json
from datetime import date, datetime
from decimal import Decimal

from apps.core.models.audit_log import AuditLog
from apps.core.middleware import CurrentUserMiddleware
from apps.users.models import UserAccount


def get_request_ip():
    try:
        from django.http import HttpRequest
        request = HttpRequest()
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    except:
        return None


def safe_serialize(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, models.Model):
        return str(obj)
    return obj


def serialize_fields(instance, exclude_fields=None):
    exclude_fields = exclude_fields or []
    return {
        field.name: safe_serialize(getattr(instance, field.name))
        for field in instance._meta.fields
        if field.name not in exclude_fields
    }


@receiver([post_save, post_delete])
def log_model_changes(sender, instance, **kwargs):
    """
    Signal handler để lưu audit log khi model thay đổi
    """
    if not hasattr(instance, 'AuditLogMixin'):
        return

    action = 'CREATE' if kwargs.get('created', False) else 'UPDATE'
    if kwargs.get('signal') == post_delete:
        action = 'DELETE'

    user = CurrentUserMiddleware.get_current_user()
    user_id = user.id if user else None

    AuditLog.objects.create(
        action=action,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        user_id=user_id
    )


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender._meta.app_label == 'core' and sender._meta.model_name == 'auditlog':
        return

    try:
        user = CurrentUserMiddleware.get_current_user() or UserAccount.objects.filter(username="Anonymous").first()
        user_id = user.id if user else None
    except ProgrammingError:
        user_id = None

    try:
        old_values = None
        if not created:
            old_values = serialize_fields(instance, exclude_fields=['created_at', 'updated_at'])

        new_values = serialize_fields(instance, exclude_fields=['created_at', 'updated_at'])

        AuditLog.objects.create(
            action='CREATE' if created else 'UPDATE',
            model_name=f"{sender._meta.app_label}.{sender._meta.model_name}",
            object_id=str(instance.pk),
            old_values=new_values if created else old_values,
            new_values=new_values,
            user_id=user_id,
            ip_address=get_request_ip(),
            action_date=timezone.now()
        )
    except Exception as e:
        # Optional: log this error to console or logging system
        print(f"[Signal log_save error] {e}")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender._meta.app_label == 'core' and sender._meta.model_name == 'auditlog':
        return

    try:
        user = CurrentUserMiddleware.get_current_user() or UserAccount.objects.filter(username="Anonymous").first()
        user_id = user.id if user else None
    except ProgrammingError:
        user_id = None

    try:
        old_values = serialize_fields(instance, exclude_fields=['created_at', 'updated_at'])

        AuditLog.objects.create(
            action='DELETE',
            model_name=f"{sender._meta.app_label}.{sender._meta.model_name}",
            object_id=str(instance.pk),
            old_values=old_values,
            new_values=None,
            user_id=user_id,
            ip_address=get_request_ip(),
            action_date=timezone.now()
        )
    except Exception as e:
        print(f"[Signal log_delete error] {e}")
