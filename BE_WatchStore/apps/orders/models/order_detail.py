from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.core.models.base import BaseModel
from apps.orders.models.order import Orders
from apps.products.models.variant import ProductVariant
from apps.orders.models.coupon import Coupon

class OrderDetail(BaseModel):
    order = models.ForeignKey(Orders, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=25, decimal_places=2)
    discount = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    coupon = models.ForeignKey(Coupon, models.DO_NOTHING, blank=True, null=True)
    final_price = models.DecimalField(max_digits=25, decimal_places=2)

    class Meta:
        managed = True
        db_table = 'orderdetail'

    def save(self, *args, **kwargs):
        # Lưu trạng thái coupon cũ trước khi thay đổi
        old_coupon = None
        if self.pk:
            try:
                old_instance = OrderDetail.objects.get(pk=self.pk)
                old_coupon = old_instance.coupon
            except OrderDetail.DoesNotExist:
                pass
        
        # Tính toán final_price trước khi lưu
        if not self.final_price:
            self.final_price = self.calculate_final_price()
        
        # Lưu order detail
        super().save(*args, **kwargs)
        
        # Cập nhật usage_count của coupon
        self.update_coupon_usage(old_coupon)

    def update_coupon_usage(self, old_coupon=None):
        """Cập nhật usage_count của coupon"""
        try:
            # Nếu có coupon cũ và khác với coupon mới, giảm usage_count
            if old_coupon and old_coupon != self.coupon:
                old_coupon.decrement_usage()
            
            # Nếu có coupon mới và order đã hoàn thành, tăng usage_count
            if self.coupon and self.order and self.order.status in ['completed', 'delivered']:
                self.coupon.increment_usage()
                
        except Exception as e:
            print(f"Error updating coupon usage: {e}")

    def calculate_final_price(self):
        # Lấy giá cơ bản từ product và price_adjustment từ variant
        base_price = self.product_variant.product.base_price
        price_adjustment = self.product_variant.price_adjustment or 0
        unit_price = base_price + price_adjustment
        
        # Tính discount từ coupon nếu có
        discount_amount = 0
        if self.coupon and self.coupon.is_valid():
            if self.coupon.discount_type == 'percentage':
                discount_amount = (unit_price * self.coupon.discount_value) / 100
            else:  # fixed amount
                discount_amount = self.coupon.discount_value
            
            # Đảm bảo discount không vượt quá giá sản phẩm
            discount_amount = min(discount_amount, unit_price)
        
        self.unit_price = unit_price
        self.discount = discount_amount
        return (unit_price - discount_amount) * self.quantity

    def delete(self, *args, **kwargs):
        # Lưu reference đến coupon trước khi xóa
        coupon = self.coupon
        
        # Xóa order detail
        super().delete(*args, **kwargs)
        
        # Giảm usage_count của coupon nếu order đã hoàn thành
        if coupon and self.order and self.order.status in ['completed', 'delivered']:
            try:
                coupon.decrement_usage()
            except Exception as e:
                print(f"Error decrementing coupon usage after delete: {e}")

# Signal để tự động cập nhật coupon usage khi order status thay đổi
# Logic chính đã được xử lý trong model Orders.update_coupon_usage_on_status_change()
# Signal này chỉ để backup và xử lý các trường hợp đặc biệt
@receiver(post_save, sender=Orders)
def update_coupon_usage_on_order_status_change(sender, instance, **kwargs):
    """Backup signal để cập nhật usage_count của coupon khi order status thay đổi"""
    # Logic chính đã được xử lý trong model Orders.save()
    # Signal này chỉ để đảm bảo tính nhất quán
    pass 