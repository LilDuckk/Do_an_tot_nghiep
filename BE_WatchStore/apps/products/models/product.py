from django.db import models
from apps.core.models.base import BaseModel

class Product(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey('Category', models.DO_NOTHING, blank=True, null=True)
    brand = models.ForeignKey('Brand', models.DO_NOTHING, blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_period = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='product_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'product' 