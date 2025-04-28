from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class AuditLog(BaseModel):
    """
    Model để lưu trữ lịch sử thay đổi của các bản ghi
    """
    ACTION_CHOICES = (
        ('CREATE', 'Tạo mới'),
        ('UPDATE', 'Cập nhật'),
        ('DELETE', 'Xóa'),
    )

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    
    user = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'audit_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_action_display()} - {self.content_type.model} - {self.object_id}"
