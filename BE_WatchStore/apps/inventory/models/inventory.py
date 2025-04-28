from django.db import models
from apps.users.models import UserAccount
from apps.products.models import ProductVariant
from apps.stores.models import Store

class Inventory(models.Model):
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventory'
        unique_together = (('product_variant', 'store'),) 