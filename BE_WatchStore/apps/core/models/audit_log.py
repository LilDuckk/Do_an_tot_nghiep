from django.db import models
from apps.core.models.base import BaseModel

class AuditLog(BaseModel):
    action = models.CharField(max_length=10, choices=[
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete')
    ])
    model_name = models.CharField(max_length=255)
    object_id = models.CharField(max_length=255)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    action_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-action_date']

    def __str__(self):
        return f"{self.action} - {self.model_name} - {self.object_id}" 