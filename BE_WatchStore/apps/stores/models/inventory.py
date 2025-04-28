from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .store import Store
from apps.products.models import ProductVariant

class Inventory(BaseModel):
    id = models.AutoField(primary_key=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='inventories')
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='inventories')
    quantity = models.IntegerField(blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventory'
        unique_together = (('product_variant', 'store'),)

class InventoryTransaction(BaseModel):
    id = models.AutoField(primary_key=True)
    inventory = models.ForeignKey(Inventory, models.DO_NOTHING, related_name='transactions', blank=True, null=True)
    transaction_type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='inventory_transactions_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='inventory_transactions_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'inventorytransaction' 