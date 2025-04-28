from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models import ProductVariant

class StockTransfer(BaseModel):
    id = models.AutoField(primary_key=True)
    source_store = models.ForeignKey('Store', models.DO_NOTHING, related_name='outgoing_transfers')
    destination_store = models.ForeignKey('Store', models.DO_NOTHING, related_name='incoming_transfers')
    transfer_date = models.DateField()
    status = models.CharField(max_length=20)
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
    received_quantity = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_transfer_details_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_transfer_details_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'stocktransferdetail'

class StockTake(BaseModel):
    id = models.AutoField(primary_key=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, related_name='stock_takes')
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_takes_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_takes_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'stocktake'

class StockTakeDetail(BaseModel):
    id = models.AutoField(primary_key=True)
    stock_take = models.ForeignKey(StockTake, models.DO_NOTHING, related_name='details')
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='stock_take_details')
    expected_quantity = models.IntegerField()
    actual_quantity = models.IntegerField()
    discrepancy = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_take_details_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='stock_take_details_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'stocktakedetail' 