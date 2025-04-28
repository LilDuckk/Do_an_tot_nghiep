from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class Brand(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    logo_url = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(default=0)
    slug = models.CharField(unique=True, max_length=255)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='brands_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='brands_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'brand' 