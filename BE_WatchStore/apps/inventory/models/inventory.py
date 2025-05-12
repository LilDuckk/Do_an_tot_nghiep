from django.db import models
from apps.core.models.base import BaseModel
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store

class Inventory(BaseModel):
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'inventory'
        unique_together = (('product_variant', 'store'),) 