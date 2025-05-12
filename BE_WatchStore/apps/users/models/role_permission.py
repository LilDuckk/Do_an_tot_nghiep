from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import Role, Permission

class RolePermission(BaseModel):
    role = models.ForeignKey(Role, models.DO_NOTHING, blank=True, null=True)
    permission = models.ForeignKey(Permission, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'rolepermission'
        unique_together = (('role', 'permission'),) 