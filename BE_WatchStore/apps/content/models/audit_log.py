from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class AuditLog(BaseModel):
    id = models.AutoField(primary_key=True)
    table_name = models.CharField(max_length=100)
    record_id = models.IntegerField()
    action = models.CharField(max_length=10)  # INSERT, UPDATE, DELETE
    old_values = models.JSONField(blank=True, null=True)
    new_values = models.JSONField(blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    action_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='audit_logs', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'auditlog' 