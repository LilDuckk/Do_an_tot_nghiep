from django.db import models
from apps.core.models.base import BaseModel

class RolePermission(BaseModel):
    role = models.ForeignKey('Role', models.DO_NOTHING, blank=True, null=True)
    permission = models.ForeignKey('Permission', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'rolepermission'
        unique_together = (('role', 'permission'),) 