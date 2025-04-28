from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models.base import BaseModel
from .role import Role


class User(AbstractUser):
    """Custom user model."""
    
    class Meta:
        db_table = 'useraccount'
        
    def __str__(self):
        return self.username

class UserAccount(BaseModel):
    id = models.AutoField(primary_key=True)
    username = models.CharField(unique=True, max_length=100)
    password = models.CharField(max_length=255)
    email = models.CharField(unique=True, max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, models.DO_NOTHING, related_name='users', blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'useraccount' 