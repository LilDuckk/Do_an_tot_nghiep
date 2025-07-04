from django.db import models
from django.core.exceptions import ValidationError
import uuid
from django.db.models import Max
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.product import Product
from apps.products.models.attribute import AttributeValue
import unidecode

class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True, related_name='variants')
    attribute_values = models.ManyToManyField(AttributeValue, related_name='variants')
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    stock_alert_threshold = models.IntegerField(blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    dimensions = models.CharField(max_length=100, blank=True, null=True)  # Format: "LxWxH"
    warranty_period = models.IntegerField(blank=True, null=True, help_text="Thời gian bảo hành theo tháng. Nếu để trống sẽ lấy từ product")
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='productvariant_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'productvariant'
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['barcode']),
            models.Index(fields=['is_active']),
            models.Index(fields=['product']),
            models.Index(fields=['warranty_period']),
        ]
        unique_together = [
            ('product', 'sku'),
        ]

    def clean(self):
        if self.price_adjustment and self.price_adjustment < 0:
            raise ValidationError({'price_adjustment': 'Price adjustment cannot be negative'})
        if self.stock_alert_threshold and self.stock_alert_threshold < 0:
            raise ValidationError({'stock_alert_threshold': 'Stock alert threshold cannot be negative'})
        if self.weight and self.weight < 0:
            raise ValidationError({'weight': 'Weight cannot be negative'})
        if self.warranty_period and self.warranty_period < 0:
            raise ValidationError({'warranty_period': 'Warranty period cannot be negative'})

    def generate_sku(self, attribute_values_list=None):
        """Tạo SKU: TEN-SAN-PHAM-GIA-TRI-1-GIA-TRI-2-...-MA8SO (tất cả viết hoa)"""
        if not self.product:
            return f"VAR-{str(uuid.uuid4())[:8]}".upper()

        # Tên sản phẩm không dấu, thay khoảng trắng bằng '-', viết hoa
        product_name = unidecode.unidecode(self.product.name).replace(' ', '-').upper()

        # Lấy attribute values
        if attribute_values_list:
            attr_values = attribute_values_list
        elif hasattr(self, '_attribute_values'):
            attr_values = [av.value for av in self._attribute_values]
        else:
            try:
                attr_values = [av.value for av in self.attribute_values.all()]
            except Exception:
                attr_values = []

        # Bỏ dấu, thay khoảng trắng bằng '-', viết hoa
        attr_parts = [unidecode.unidecode(str(val)).replace(' ', '-').upper() for val in attr_values]

        # Mã random 8 ký tự, viết hoa
        rand_part = str(uuid.uuid4())[:8].upper()

        sku_parts = [product_name] + attr_parts + [rand_part]
        sku = '-'.join([part for part in sku_parts if part])

        return sku

    def get_final_price(self):
        """Lấy giá cuối cùng của variant"""
        if not self.product:
            return 0
        
        base_price = self.product.base_price
        adjustment = self.price_adjustment or 0
        return base_price + adjustment

    def get_attribute_display(self):
        """Lấy thông tin hiển thị của attributes"""
        try:
            attr_values = self.attribute_values.select_related('attribute_type').all()
            return [
                {
                    'type': av.attribute_type.name,
                    'value': av.value
                }
                for av in sorted(attr_values, key=lambda x: x.attribute_type.name)
            ]
        except Exception:
            return []

    def validate_attribute_combination(self):
        """Kiểm tra combination attributes chỉ để tránh duplicate, không kiểm tra số lượng attribute type/value"""
        if not self.product:
            return True
        
        # Lấy danh sách id attribute value của variant này
        current_attr_ids = set([av.id for av in self.attribute_values.all()])
        
        # Kiểm tra xem combination này đã tồn tại chưa (trừ chính nó)
        existing_variants = ProductVariant.objects.filter(
            product=self.product
        ).exclude(pk=self.pk if self.pk else None)
        for variant in existing_variants:
            variant_attr_ids = set([av.id for av in variant.attribute_values.all()])
            if variant_attr_ids == current_attr_ids:
                return False
        return True

    def save(self, *args, **kwargs):
        # If attribute values are passed during creation, store them temporarily
        if 'attribute_values' in kwargs:
            self._attribute_values = kwargs.pop('attribute_values')
        
        # Generate SKU before saving if not already set
        if not self.sku:
            self.sku = self.generate_sku()
        
        # Save the instance first
        super().save(*args, **kwargs)
        
        # If attribute values were stored, set them after saving
        if hasattr(self, '_attribute_values'):
            self.attribute_values.set(self._attribute_values)
            delattr(self, '_attribute_values')
        
        # Validate attribute combination AFTER saving (only if we have an ID)
        if self.pk and self.attribute_values.exists():
            if not self.validate_attribute_combination():
                # If validation fails, delete the variant and raise error
                self.delete()
                raise ValidationError('Invalid attribute combination or duplicate variant')

    @classmethod
    def create_variant_with_attributes(cls, product, attribute_values, **kwargs):
        """Tạo variant với attributes"""
        from apps.products.services import ProductVariantService
        
        # Sử dụng service để tạo variant với validation
        return ProductVariantService.create_variant_with_validation(
            product, kwargs, attribute_values
        )

    def get_warranty_period(self):
        """
        Lấy thời gian bảo hành với logic fallback:
        1. Nếu variant có warranty_period → dùng variant
        2. Nếu variant không có → fallback về product.warranty_period
        """
        if self.warranty_period is not None:
            return self.warranty_period
        
        if self.product and self.product.warranty_period:
            return self.product.warranty_period
        
        return None

    def has_warranty(self):
        """Kiểm tra variant có bảo hành không"""
        return self.get_warranty_period() is not None and self.get_warranty_period() > 0

class ProductVariantAttribute(BaseModel):
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True, related_name='attributes')
    attribute_value = models.ForeignKey(AttributeValue, models.DO_NOTHING, blank=True, null=True)
    required = models.BooleanField(default=False)

    class Meta:
        managed = True
        db_table = 'productvariantattribute'
        unique_together = (('product_variant', 'attribute_value'),)
        indexes = [
            models.Index(fields=['product_variant', 'attribute_value']),
            models.Index(fields=['required']),
        ]

    def clean(self):
        if self.required and not self.attribute_value:
            raise ValidationError({'attribute_value': 'Attribute value is required when attribute is marked as required'})

class VariantImage(BaseModel):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='variants/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        managed = True
        db_table = 'variantimage'
        ordering = ['display_order', 'id']
    
    def save(self, *args, **kwargs):
        # Ensure only one primary image per variant
        if self.is_primary:
            self.variant.images.filter(is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
    
