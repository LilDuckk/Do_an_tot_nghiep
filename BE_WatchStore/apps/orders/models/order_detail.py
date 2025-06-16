from django.db import models
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
        # Tính toán final_price trước khi lưu
        if not self.final_price:
            self.final_price = self.calculate_final_price()
        super().save(*args, **kwargs)

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