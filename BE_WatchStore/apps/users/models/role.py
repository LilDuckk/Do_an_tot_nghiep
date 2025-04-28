from django.db import models
from apps.core.models.base import BaseModel
from .permission import Permission

class Role(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'role'

class RolePermission(BaseModel):
    id = models.AutoField(primary_key=True)
    role = models.ForeignKey(Role, models.DO_NOTHING, related_name='permissions')
    permission = models.ForeignKey(Permission, models.DO_NOTHING, related_name='roles')

    class Meta:
        managed = False
        db_table = 'rolepermission'
        unique_together = (('role', 'permission'),) 