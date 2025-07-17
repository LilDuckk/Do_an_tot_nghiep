import os
import random
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.products.models import Product, ProductImage
from django.core.files import File

class Command(BaseCommand):
    help = 'Gán ngẫu nhiên ảnh từ media/VIET&CO vào các sản phẩm (Product) dưới dạng ProductImage.'

    def add_arguments(self, parser):
        parser.add_argument('--images-per-product', type=int, default=1, help='Số ảnh gán cho mỗi sản phẩm (mặc định: 1)')
        parser.add_argument('--replace', action='store_true', help='Xóa hết ảnh cũ trước khi gán ảnh mới')

    def handle(self, *args, **options):
        images_per_product = options['images_per_product']
        replace = options['replace']
        vietco_dir = os.path.join(settings.BASE_DIR, 'media', 'VIET&CO')
        all_images = [f for f in os.listdir(vietco_dir) if f.lower().endswith('.webp')]
        if not all_images:
            self.stdout.write(self.style.ERROR('Không tìm thấy ảnh .webp nào trong media/VIET&CO'))
            return
        products = Product.objects.filter(is_deleted=False)
        if not products.exists():
            self.stdout.write(self.style.ERROR('Không có sản phẩm nào trong database!'))
            return
        self.stdout.write(f'Có {len(products)} sản phẩm, {len(all_images)} ảnh. Mỗi sản phẩm sẽ được gán {images_per_product} ảnh ngẫu nhiên.')
        for product in products:
            if replace:
                product.images.all().delete()
            chosen_images = random.sample(all_images, min(images_per_product, len(all_images)))
            for idx, img_name in enumerate(chosen_images):
                img_path = os.path.join(vietco_dir, img_name)
                with open(img_path, 'rb') as img_file:
                    django_file = File(img_file, name=img_name)
                    ProductImage.objects.create(
                        product=product,
                        image=django_file,
                        is_primary=(idx == 0),
                    )
            self.stdout.write(f'Đã gán {len(chosen_images)} ảnh cho sản phẩm {product.id} - {product.name}')
        self.stdout.write(self.style.SUCCESS('Hoàn thành gán ảnh cho tất cả sản phẩm!')) 