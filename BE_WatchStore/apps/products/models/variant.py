from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.product import Product
from apps.products.models.attribute import AttributeValue

class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True, related_name='variants')
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock_alert_threshold = models.IntegerField(blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='productvariant_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'productvariant'
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['barcode']),
            models.Index(fields=['is_active']),
        ]

    def clean(self):
        if self.price_adjustment and self.price_adjustment < 0:
            raise ValidationError({'price_adjustment': 'Price adjustment cannot be negative'})
        if self.stock_alert_threshold and self.stock_alert_threshold < 0:
            raise ValidationError({'stock_alert_threshold': 'Stock alert threshold cannot be negative'})

    def generate_sku(self):
        if not self.product:
            return None
            
        # Lấy tất cả attribute values của variant
        attribute_values = self.attributes.values_list('attribute_value__value', flat=True)
        if not attribute_values:
            return None
            
        # Tạo SKU theo format: product_name-attribute_value_name-variant_id
        sku_parts = [self.product.name]
        sku_parts.extend(attribute_values)
        sku_parts.append(str(self.id if self.id else 'new'))
        
        return '-'.join(sku_parts).replace(' ', '-').upper()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

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