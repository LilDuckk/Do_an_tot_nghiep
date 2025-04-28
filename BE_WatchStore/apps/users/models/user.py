from django.db import models
from apps.core.models.base import BaseModel

class UserAccount(BaseModel):
    username = models.CharField(unique=True, max_length=100)
    password = models.CharField(max_length=255)
    email = models.CharField(unique=True, max_length=255, blank=True, null=True)
    role = models.ForeignKey('Role', models.DO_NOTHING, blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    failed_login_attempts = models.IntegerField(blank=True, null=True)
    account_locked_until = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'useraccount' 