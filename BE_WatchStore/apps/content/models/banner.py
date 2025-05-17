from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
import os
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def banner_image_upload_path(instance, filename):
    """Generate unique filename for banner images."""
    # Lấy tên file từ title, bỏ dấu và chuyển thành chữ thường
    title_slug = slugify(instance.title)
    return f"banner/{title_slug}.png"

class Banner(BaseModel):
    title = models.CharField(max_length=255)
    image = models.FileField(
        upload_to=banner_image_upload_path,
        validators=[FileExtensionValidator(['png', 'jpg', 'jpeg', 'gif', 'webp'])],
        max_length=255,
        null=True,
        blank=True
    )
    link_url = models.CharField(max_length=255, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    banner_location = models.CharField(max_length=50)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='banner_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'banner'

    def save(self, *args, **kwargs):
        if self.image:
            # Đọc ảnh gốc
            img = Image.open(self.image)
            
            # Chuyển đổi sang RGB nếu ảnh có kênh alpha
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            
            # Chuyển đổi sang PNG
            output = BytesIO()
            img.save(output, format='PNG', quality=95)
            output.seek(0)
            
            # Tạo tên file mới từ title
            filename = f"{slugify(self.title)}.png"
            
            # Lưu ảnh mới
            self.image.save(filename, ContentFile(output.read()), save=False)
            
        super().save(*args, **kwargs) 