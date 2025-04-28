from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .supplier import Supplier
from .store import Store
from apps.products.models import ProductVariant

class PurchaseOrder(BaseModel):
    id = models.AutoField(primary_key=True)
    supplier = models.ForeignKey(Supplier, models.DO_NOTHING, related_name='purchase_orders', blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='purchase_orders', blank=True, null=True)
    order_date = models.DateTimeField(blank=True, null=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='purchase_orders_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='purchase_orders_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'purchaseorder'

class PurchaseOrderDetail(BaseModel):
    id = models.AutoField(primary_key=True)
    purchase_order = models.ForeignKey(PurchaseOrder, models.DO_NOTHING, related_name='details')
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='purchase_order_details')
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'purchaseorderdetail' 