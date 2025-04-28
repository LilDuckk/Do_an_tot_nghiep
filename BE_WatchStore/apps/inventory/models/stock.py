from django.db import models
from apps.users.models import UserAccount
from apps.products.models import ProductVariant
from apps.stores.models import Store

class StockTake(models.Model):
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='stocktake_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktake'

class StockTakeDetail(models.Model):
    stock_take = models.ForeignKey(StockTake, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    expected_quantity = models.IntegerField(blank=True, null=True)
    actual_quantity = models.IntegerField(blank=True, null=True)
    discrepancy = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktakedetail'

class StockTransfer(models.Model):
    source_store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    destination_store = models.ForeignKey(Store, models.DO_NOTHING, related_name='stocktransfer_destination_store_set', blank=True, null=True)
    transfer_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='stocktransfer_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktransfer'

class StockTransferDetail(models.Model):
    stock_transfer = models.ForeignKey(StockTransfer, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    received_quantity = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktransferdetail' 