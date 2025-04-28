from django.db import models
from apps.core.models.base import BaseModel
from .user import UserAccount
from .role import Role

class UserRole(BaseModel):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='roles')
    role = models.ForeignKey(Role, models.DO_NOTHING, related_name='users')
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'userrole'
        unique_together = (('user', 'role'),) 