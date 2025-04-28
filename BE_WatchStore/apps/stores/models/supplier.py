from django.db import models
from apps.core.models.base import BaseModel

class Supplier(BaseModel):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    tax_code = models.CharField(max_length=50, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('users.UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('users.UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='supplier_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'supplier' 