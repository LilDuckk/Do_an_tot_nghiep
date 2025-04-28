from django.db import models
from apps.core.models.base import BaseModel

class Role(BaseModel):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'role' 