from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount

class CouponManager(models.Manager):
    def create_or_restore(self, **kwargs):
        """Tạo coupon mới hoặc khôi phục coupon đã bị xóa mềm"""
        code = kwargs.get('code')
        if not code:
            return self.create(**kwargs)
        
        # Kiểm tra xem có coupon cũ với cùng code nhưng đã bị xóa mềm không
        existing_deleted = self.filter(
            code=code,
            is_deleted=True
        ).first()
        
        if existing_deleted:
            # Khôi phục coupon cũ và cập nhật thông tin mới
            for key, value in kwargs.items():
                if hasattr(existing_deleted, key):
                    setattr(existing_deleted, key, value)
            
            existing_deleted.is_deleted = False
            existing_deleted.usage_count = 0  # Reset usage_count
            existing_deleted.save()
            return existing_deleted
        
        # Tạo coupon mới nếu không có coupon cũ
        return self.create(**kwargs)

    def get_queryset(self):
        """Chỉ trả về coupon chưa bị xóa mềm"""
        return super().get_queryset().filter(is_deleted=False)

class Coupon(BaseModel):
    code = models.CharField(max_length=50)  # Bỏ unique=True
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, choices=[
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount')
    ])
    discount_value = models.DecimalField(max_digits=25, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    start_date = models.DateTimeField()
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(default=1)
    usage_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='coupon_updated_by_set', blank=True, null=True)

    objects = CouponManager()

    class Meta:
        managed = True
        db_table = 'coupon'
        # Tạo unique constraint chỉ cho coupon chưa bị xóa
        unique_together = [('code', 'is_deleted')]
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
            models.Index(fields=['start_date']),
            models.Index(fields=['expires_at']),
        ]

    def clean(self):
        """Validation cho coupon"""
        if self.start_date and self.expires_at and self.start_date >= self.expires_at:
            raise ValidationError('Start date must be before expires date')
        
        if self.discount_value <= 0:
            raise ValidationError('Discount value must be greater than 0')
        
        if self.usage_limit <= 0:
            raise ValidationError('Usage limit must be greater than 0')
        
        if self.usage_count < 0:
            raise ValidationError('Usage count cannot be negative')

    def save(self, *args, **kwargs):
        """Tự động set is_active = True khi tạo mới và validation"""
        # Nếu đang tạo mới và chưa có usage_count
        if not self.pk and self.usage_count is None:
            self.usage_count = 0
        
        # Validation trước khi lưu
        self.clean()
        
        super().save(*args, **kwargs)

    def is_valid(self):
        """Kiểm tra coupon có hợp lệ không"""
        now = timezone.now()
        
        # Đảm bảo usage_count không phải None
        usage_count = self.usage_count or 0
        
        return (
            self.is_active and
            self.start_date <= now <= self.expires_at and
            usage_count < self.usage_limit
        )

    def get_usage_count(self):
        """Lấy số lần sử dụng coupon từ database"""
        from apps.orders.models.order_detail import OrderDetail
        return OrderDetail.objects.filter(
            coupon=self,
            order__status__in=['completed', 'delivered']
        ).count()

    def sync_usage_count(self):
        """Đồng bộ usage_count từ database"""
        self.usage_count = self.get_usage_count()
        self.save(update_fields=['usage_count'])
        return self.usage_count or 0

    def can_use(self, order_amount=None):
        """Kiểm tra có thể sử dụng coupon không"""
        if not self.is_valid():
            return False, "Coupon không hợp lệ"
        
        usage_count = self.usage_count or 0
        if usage_count >= self.usage_limit:
            return False, "Coupon đã hết lượt sử dụng"
        
        if order_amount and self.minimum_order_amount:
            if order_amount < self.minimum_order_amount:
                return False, f"Đơn hàng tối thiểu {self.minimum_order_amount}"
        
        return True, "Có thể sử dụng"

    def apply_discount(self, amount):
        """Áp dụng giảm giá cho số tiền"""
        if not self.is_valid():
            return amount
        
        if self.discount_type == 'percentage':
            discount = (amount * self.discount_value) / 100
        else:  # fixed amount
            discount = self.discount_value
        
        return max(0, amount - discount)

    def increment_usage(self):
        """Tăng số lần sử dụng coupon"""
        usage_count = self.usage_count or 0
        if usage_count < self.usage_limit:
            self.usage_count = usage_count + 1
            self.save(update_fields=['usage_count'])
            return True
        return False

    def decrement_usage(self):
        """Giảm số lần sử dụng coupon (khi hủy đơn hàng)"""
        usage_count = self.usage_count or 0
        if usage_count > 0:
            self.usage_count = usage_count - 1
            self.save(update_fields=['usage_count'])
            return True
        return False

    def get_remaining_usage(self):
        """Lấy số lần sử dụng còn lại"""
        usage_count = self.usage_count or 0
        return max(0, self.usage_limit - usage_count)

    def get_discount_amount(self, order_amount):
        """Lấy số tiền giảm giá cho đơn hàng"""
        if not self.is_valid():
            return 0
        
        if self.discount_type == 'percentage':
            return (order_amount * self.discount_value) / 100
        else:  # fixed amount
            return min(self.discount_value, order_amount) 