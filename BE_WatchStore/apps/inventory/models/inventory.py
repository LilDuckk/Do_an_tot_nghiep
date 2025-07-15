from django.db import models
from django.utils import timezone
from apps.core.models.base import BaseModel
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.users.models.user import UserAccount

class Inventory(BaseModel):
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField(default=0)
    last_updated = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True, related_name='inventory_created_by_set')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', blank=True, null=True, related_name='inventory_updated_by_set')

    class Meta:
        managed = True
        db_table = 'inventory'
        # unique_together = (('product_variant', 'store'),)  # Đã bỏ để dùng partial unique index qua migration

    def save(self, *args, **kwargs):
        if not self.quantity:
            self.quantity = 0
        self.last_updated = timezone.now()
        super().save(*args, **kwargs) 