from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .store import Store
from apps.products.models import ProductVariant

class StockTake(BaseModel):
    id = models.AutoField(primary_key=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='stock_takes', blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
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
    expected_quantity = models.IntegerField(blank=True, null=True)
    actual_quantity = models.IntegerField(blank=True, null=True)
    discrepancy = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktakedetail' 