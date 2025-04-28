from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .store import Store
from .supplier import Supplier
from apps.products.models import ProductVariant

class PurchaseOrder(BaseModel):
    id = models.AutoField(primary_key=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='purchase_orders')
    supplier = models.ForeignKey(Supplier, models.DO_NOTHING, related_name='purchase_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
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
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='purchase_order_details_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='purchase_order_details_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'purchaseorderdetail' 