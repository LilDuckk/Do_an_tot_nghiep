from django.db import models
from apps.core.models.base import BaseModel

class Permission(BaseModel):
    name = models.CharField(max_length=50)
    code = models.CharField(unique=True, max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'permission' 