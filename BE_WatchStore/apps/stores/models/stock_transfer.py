from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .store import Store
from apps.products.models import ProductVariant

class StockTransfer(BaseModel):
    id = models.AutoField(primary_key=True)
    source_store = models.ForeignKey(Store, models.DO_NOTHING, related_name='outgoing_transfers')
    destination_store = models.ForeignKey(Store, models.DO_NOTHING, related_name='incoming_transfers')
    transfer_date = models.DateTimeField()
    status = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_transfers_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_transfers_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'stocktransfer'

class StockTransferDetail(BaseModel):
    id = models.AutoField(primary_key=True)
    stock_transfer = models.ForeignKey(StockTransfer, models.DO_NOTHING, related_name='details')
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='stock_transfer_details')
    quantity = models.IntegerField()
    received_quantity = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'stocktransferdetail' 