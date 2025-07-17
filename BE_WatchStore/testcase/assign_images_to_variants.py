import os
import random
import shutil
import glob
from pathlib import Path
from django.core.files import File

def assign_images_to_variants():
    """
    Áp dụng ảnh ngẫu nhiên cho tất cả các biến thể
    """
    # Đường dẫn đến thư mục ảnh đã đổi tên
    image_dir = Path("media/VIET&CO")
    
    if not image_dir.exists():
        print(f"Thư mục {image_dir} không tồn tại!")
        return
    
    # Lấy tất cả file ảnh đã đổi tên
    image_files = []
    for ext in ['*.webp', '*.jpg', '*.jpeg', '*.png']:
        image_files.extend(glob.glob(str(image_dir / ext)))
    
    if not image_files:
        print("Không tìm thấy file ảnh nào!")
        return
    
    print(f"Tìm thấy {len(image_files)} file ảnh")
    
    # Lấy tất cả các biến thể
    ProductVariant = apps.get_model('products', 'ProductVariant')
    VariantImage = apps.get_model('products', 'VariantImage')
    
    variants = ProductVariant.objects.all()
    variant_count = variants.count()
    
    if variant_count == 0:
        print("Không tìm thấy biến thể nào trong database!")
        return
    
    print(f"Tìm thấy {variant_count} biến thể cần gán ảnh")
    
    # Tạo thư mục variants nếu chưa có
    variants_dir = Path("media/variants")
    variants_dir.mkdir(exist_ok=True)
    
    # Thống kê
    success_count = 0
    error_count = 0
    
    # Gán ảnh cho từng biến thể
    for variant in variants:
        try:
            # Chọn ngẫu nhiên 1-3 ảnh cho mỗi biến thể
            num_images = random.randint(1, 3)
            selected_images = random.sample(image_files, min(num_images, len(image_files)))
            
            for i, image_path in enumerate(selected_images):
                image_path = Path(image_path)
                
                # Tạo tên file mới cho variant
                variant_image_name = f"variant_{variant.id}_{i+1}{image_path.suffix}"
                variant_image_path = variants_dir / variant_image_name
                
                # Copy file ảnh
                shutil.copy2(image_path, variant_image_path)
                
                # Tạo VariantImage record
                with open(variant_image_path, 'rb') as f:
                    variant_image = VariantImage.objects.create(
                        variant=variant,
                        image=File(f, name=variant_image_name),
                        display_order=i+1
                    )
                
                print(f"Gán ảnh {image_path.name} cho variant {variant.id} (ảnh {i+1})")
            
            success_count += 1
            
        except Exception as e:
            print(f"Lỗi khi gán ảnh cho variant {variant.id}: {e}")
            error_count += 1
    
    print(f"\nHoàn thành gán ảnh!")
    print(f"Thành công: {success_count} biến thể")
    print(f"Lỗi: {error_count} biến thể")
    
    # Thống kê tổng số ảnh đã gán
    total_images = VariantImage.objects.count()
    print(f"Tổng số ảnh đã gán: {total_images}")

if __name__ == "__main__":
    import django
    import os
    import sys
    
    # Setup Django
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    
    # Import apps sau khi setup Django
    from django.apps import apps
    
    assign_images_to_variants()