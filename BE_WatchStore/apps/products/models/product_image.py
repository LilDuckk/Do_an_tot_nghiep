import os
from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant

def product_image_upload_path(instance, filename):
    """Generate unique filename for product images."""
    # Get product or variant name for path
    base_name = instance.product.name if instance.product else \
                instance.product_variant.name if instance.product_variant else 'unknown'
    
    # Slugify the base name and add timestamp to ensure uniqueness
    slug_name = slugify(base_name)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{slug_name}_{instance.id}{ext}"
    
    return f"products/{unique_filename}"

class ProductImage(BaseModel):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True, related_name='images')
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True, related_name='images')
    image = models.FileField(
        upload_to=product_image_upload_path,
        validators=[FileExtensionValidator(['png', 'jpg', 'jpeg', 'gif', 'webp'])],
        max_length=255,
        null=True,  # Allow null values for existing records
        blank=True  # Allow blank in forms
    )
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='productimage_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'productimage'
        
    def save(self, *args, **kwargs):
        # Ensure only one primary image per product/variant
        if self.is_primary:
            model_class = self.product if self.product else self.product_variant
            model_class.images.filter(is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
