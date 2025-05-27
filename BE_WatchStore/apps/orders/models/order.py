from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.orders.models.customer import Customer
from django.db.models import Sum, F
from decimal import Decimal
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Orders(BaseModel):
    customer = models.ForeignKey(Customer, models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, blank=True, null=True)
    employee = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    order_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_method = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    note = models.TextField(blank=True, null=True)
    is_online_order = models.BooleanField(default=False)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='orders_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'orders'

    def calculate_subtotal(self):
        """
        Tính tổng final_price của tất cả order_detail
        """
        from apps.orders.models.order_detail import OrderDetail
        if not self.pk:  # Nếu đơn hàng chưa được lưu
            return Decimal('0')
            
        subtotal = OrderDetail.objects.filter(
            order=self,
            is_deleted=False
        ).aggregate(
            total=Sum('final_price')
        )['total'] or Decimal('0')
        return subtotal

    def calculate_total_amount(self):
        """
        Tính total_amount = subtotal - tax - shipping_fee - discount
        """
        subtotal = self.calculate_subtotal()
        tax_amount = (subtotal * self.tax) / 100 if self.tax else Decimal('0')
        total = subtotal - tax_amount - (self.shipping_fee or Decimal('0')) - (self.discount or Decimal('0'))
        return max(Decimal('0'), total)

    def update_totals(self):
        """
        Cập nhật subtotal và total_amount
        """
        self.subtotal = self.calculate_subtotal()
        self.total_amount = self.calculate_total_amount()
        self.save(update_fields=['subtotal', 'total_amount'])

    def save(self, *args, **kwargs):
        # Chỉ tính toán subtotal và total_amount nếu đơn hàng đã được lưu
        if self.pk:
            self.subtotal = self.calculate_subtotal()
            self.total_amount = self.calculate_total_amount()
        super().save(*args, **kwargs)

# Signal để cập nhật Order khi OrderDetail thay đổi
@receiver([post_save, post_delete], sender='orders.OrderDetail')
def update_order_totals(sender, instance, **kwargs):
    """
    Cập nhật subtotal và total_amount của Order khi OrderDetail được tạo/cập nhật/xóa
    """
    if instance.order:
        instance.order.update_totals() 