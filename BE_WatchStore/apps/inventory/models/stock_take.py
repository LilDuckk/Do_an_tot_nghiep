from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
from apps.stores.models.store import Store
from apps.products.models.variant import ProductVariant

class StockTake(BaseModel):
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='stocktake_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'stocktake'

class StockTakeDetail(BaseModel):
    stock_take = models.ForeignKey(StockTake, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    expected_quantity = models.IntegerField(blank=True, null=True)
    actual_quantity = models.IntegerField(blank=True, null=True)
    discrepancy = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'stocktakedetail' 