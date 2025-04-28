from django.db import models
from apps.users.models import UserAccount, Customer, Employee
from apps.stores.models import Store
from apps.products.models import ProductVariant
from apps.core.models.base import BaseModel

class Order(BaseModel):
    id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING, related_name='orders', blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='orders', blank=True, null=True)
    employee = models.ForeignKey(Employee, models.DO_NOTHING, related_name='orders', blank=True, null=True)
    order_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_method = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    is_online_order = models.BooleanField(default=False)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='orders_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='orders_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'orders'

class OrderDetail(BaseModel):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, models.DO_NOTHING, related_name='details')
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='order_details')
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orderdetail' 