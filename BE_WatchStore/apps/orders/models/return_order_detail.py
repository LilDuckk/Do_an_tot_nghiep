from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.core.models.base import BaseModel
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.order_detail import OrderDetail
from apps.products.models.variant import ProductVariant

class ReturnOrderDetail(BaseModel):
    return_order = models.ForeignKey(ReturnOrder, models.DO_NOTHING, blank=True, null=True)
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    reason = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'returnorderdetail'

    def save(self, *args, **kwargs):
        # Lưu return order detail trước
        super().save(*args, **kwargs)
        
        # Tự động cập nhật refund_amount của return order
        if self.return_order:
            self.update_return_order_refund()

    def update_return_order_refund(self):
        """Cập nhật refund_amount của return order"""
        try:
            # Tính toán refund_amount mới
            refund_amount = self.return_order.calculate_refund_amount()
            
            # Cập nhật refund_amount nếu có thay đổi
            if self.return_order.refund_amount != refund_amount:
                self.return_order.refund_amount = refund_amount
                self.return_order.save(update_fields=['refund_amount'])
        except Exception as e:
            # Log lỗi nhưng không làm crash
            print(f"Error updating refund amount: {e}")

    def delete(self, *args, **kwargs):
        # Lưu reference đến return_order trước khi xóa
        return_order = self.return_order
        
        # Xóa return order detail
        super().delete(*args, **kwargs)
        
        # Cập nhật refund_amount của return order sau khi xóa
        if return_order:
            try:
                refund_amount = return_order.calculate_refund_amount()
                if return_order.refund_amount != refund_amount:
                    return_order.refund_amount = refund_amount
                    return_order.save(update_fields=['refund_amount'])
            except Exception as e:
                print(f"Error updating refund amount after delete: {e}")

# Signal để tự động cập nhật refund_amount
@receiver(post_save, sender=ReturnOrderDetail)
def update_refund_amount_on_save(sender, instance, created, **kwargs):
    """Tự động cập nhật refund_amount khi save ReturnOrderDetail"""
    if instance.return_order:
        try:
            instance.return_order.update_refund_amount()
        except Exception as e:
            print(f"Signal error updating refund amount: {e}")

@receiver(post_delete, sender=ReturnOrderDetail)
def update_refund_amount_on_delete(sender, instance, **kwargs):
    """Tự động cập nhật refund_amount khi xóa ReturnOrderDetail"""
    if instance.return_order:
        try:
            instance.return_order.update_refund_amount()
        except Exception as e:
            print(f"Signal error updating refund amount after delete: {e}") 