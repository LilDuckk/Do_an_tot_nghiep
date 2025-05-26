from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import os

def convert_to_png(image):
    """
    Chuyển đổi ảnh sang định dạng PNG
    Args:
        image: File ảnh từ request.FILES
    Returns:
        ContentFile: File ảnh PNG mới
    """
    # Mở ảnh bằng PIL
    img = Image.open(image)
    
    # Chuyển đổi sang RGB nếu ảnh ở chế độ RGBA
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    
    # Tạo buffer để lưu ảnh PNG
    buffer = BytesIO()
    
    # Lưu ảnh dưới dạng PNG với chất lượng tốt
    img.save(buffer, format='PNG', quality=95, optimize=True)
    
    # Tạo tên file mới với đuôi .png
    filename = os.path.splitext(image.name)[0] + '.png'
    
    # Tạo ContentFile từ buffer
    return ContentFile(buffer.getvalue(), name=filename) 