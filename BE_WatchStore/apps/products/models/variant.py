from django.db import models
from django.core.exceptions import ValidationError
import uuid
from django.db.models import Max
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.product import Product
from apps.products.models.attribute import AttributeValue

class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True, related_name='variants')
    attribute_values = models.ManyToManyField(AttributeValue, related_name='variants')
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

    def generate_sku(self, attribute_values_list=None):
        # Fallback SKU generation method
        if not self.product:
            return f"VAR-{str(uuid.uuid4())[:8]}".upper()
        
        # Prepare SKU parts
        sku_parts = [
            # Normalize product name: remove spaces, convert to uppercase
            self.product.name.replace(' ', '-').upper()
        ]
        
        # Determine attribute values
        if attribute_values_list:
            # Use passed attribute values
            attr_values = attribute_values_list
        elif hasattr(self, '_attribute_values'):
            # Use pre-set attribute values
            attr_values = [av.value for av in self._attribute_values]
        else:
            # Try to get attribute values from the many-to-many relationship
            try:
                # Fetch attribute values with their details
                attr_values_qs = self.attribute_values.select_related('attribute_type').all()
                # Sắp xếp theo attribute_type để đảm bảo thứ tự nhất quán
                attr_values = [
                    f"{av.attribute_type.name}-{av.value}"
                    for av in sorted(attr_values_qs, key=lambda x: x.attribute_type.name)
                ]
            except Exception:
                attr_values = []
        
        # Add attribute values to SKU parts
        if attr_values:
            sku_parts.extend([
                str(value).replace(' ', '-').upper() 
                for value in attr_values
            ])
        
        # Add variant identifier (use ID or a unique suffix)
        unique_suffix = str(uuid.uuid4())[:8]
        sku_parts.append(unique_suffix)
        
        # Create base SKU
        base_sku = '-'.join(sku_parts)
        
        # Ensure uniqueness by appending a counter if needed
        final_sku = base_sku
        counter = 1
        while ProductVariant.objects.filter(sku=final_sku).exists():
            final_sku = f"{base_sku}-{counter}"
            counter += 1
        
        return final_sku

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

    class Meta:
        managed = True
        db_table = 'variantimage'
    
