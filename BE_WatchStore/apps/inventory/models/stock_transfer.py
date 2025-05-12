from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
from apps.stores.models.store import Store
from apps.products.models.variant import ProductVariant

class StockTransfer(BaseModel):
    source_store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    destination_store = models.ForeignKey(Store, models.DO_NOTHING, related_name='stocktransfer_destination_store_set', blank=True, null=True)
    transfer_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='stocktransfer_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'stocktransfer'

class StockTransferDetail(BaseModel):
    stock_transfer = models.ForeignKey(StockTransfer, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    received_quantity = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'stocktransferdetail' 