from django.db import models
from apps.core.models.base import BaseModel

class InventoryTransaction(BaseModel):
    inventory = models.ForeignKey('Inventory', models.DO_NOTHING, blank=True, null=True)
    transaction_type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='inventorytransaction_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventorytransaction' 