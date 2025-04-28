from django.db import models
from apps.core.models.base import BaseModel

class Store(BaseModel):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    store_code = models.CharField(unique=True, max_length=50)
    opening_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    manager = models.ForeignKey('Employee', models.DO_NOTHING, blank=True, null=True, related_name='managed_stores')
    created_by = models.ForeignKey('users.UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('users.UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='store_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'store' 