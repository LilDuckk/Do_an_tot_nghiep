from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount

class Store(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    store_code = models.CharField(unique=True, max_length=50)
    opening_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    manager = models.ForeignKey('users.Employee', models.DO_NOTHING, related_name='managed_stores', blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stores_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stores_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'store' 