from django.core.management.base import BaseCommand
from django.apps import apps
from apps.products.models import Product, ProductVariant, Brand, Category, AttributeValue
from apps.users.models import UserAccount
import random
from decimal import Decimal
import unidecode


def generate_product_name():
    """Tạo tên sản phẩm ngẫu nhiên"""
    brands = ['casio', 'patek philip', 'citizen', 'pablo', 'rolex']
    editions = ['new edition', 'limited', 'special', 'casual']
    years = ['2021', '2022', '2023', '2024', '2025']
    
    brand = random.choice(brands)
    edition = random.choice(editions)
    year = random.choice(years)
    
    return f"{brand} {edition} {year}"


def generate_slug(name):
    """Tạo slug từ tên sản phẩm"""
    # Loại bỏ dấu và thay khoảng trắng bằng dấu gạch ngang
    slug = unidecode.unidecode(name.lower())
    slug = slug.replace(' ', '-')
    # Loại bỏ các ký tự đặc biệt
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    # Loại bỏ dấu gạch ngang liên tiếp
    slug = '-'.join(filter(None, slug.split('-')))
    return slug


def generate_base_price():
    """Tạo giá cơ bản với 3 số cuối là 000"""
    # Random từ 1000000 đến 10000000
    base = random.randint(1000, 10000) * 1000
    return Decimal(str(base))


def generate_price_adjustment():
    """Tạo điều chỉnh giá với 3 số cuối là 000"""
    # Random từ 0 đến 500000
    adjustment = random.randint(0, 500) * 1000
    return Decimal(str(adjustment))


class Command(BaseCommand):
    help = 'Tạo dữ liệu sản phẩm và biến thể mẫu'

    def add_arguments(self, parser):
        parser.add_argument(
            '--num-products',
            type=int,
            default=20,
            help='Số lượng sản phẩm muốn tạo (mặc định: 20)'
        )
        parser.add_argument(
            '--variants-per-product',
            type=int,
            default=3,
            help='Số biến thể mỗi sản phẩm (mặc định: 3)'
        )

    def handle(self, *args, **options):
        num_products = options['num_products']
        variants_per_product = options['variants_per_product']
        
        self.stdout.write("🚀 BẮT ĐẦU TẠO DỮ LIỆU SẢN PHẨM MẪU")
        self.stdout.write("=" * 50)
        
        # Kiểm tra dữ liệu hiện tại
        if not self.check_existing_data():
            return
        
        # Tạo sản phẩm
        products = self.create_sample_products(num_products)
        
        if products:
            # Tạo biến thể
            self.create_sample_variants(products, variants_per_product)
            
            # Thống kê cuối
            self.stdout.write("\n" + "=" * 50)
            self.stdout.write("📈 THỐNG KÊ CUỐI")
            self.stdout.write(f"  - Sản phẩm đã tạo: {len(products)}")
            self.stdout.write(f"  - Biến thể đã tạo: {len(products) * variants_per_product}")
            self.stdout.write(f"  - Tổng sản phẩm trong DB: {Product.objects.count()}")
            self.stdout.write(f"  - Tổng biến thể trong DB: {ProductVariant.objects.count()}")
        
        self.stdout.write("\n✅ HOÀN THÀNH!")

    def check_existing_data(self):
        """Kiểm tra dữ liệu hiện tại"""
        self.stdout.write("=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===")
        
        try:
            product_count = Product.objects.count()
            variant_count = ProductVariant.objects.count()
            brand_count = Brand.objects.count()
            category_count = Category.objects.count()
            attr_value_count = AttributeValue.objects.count()
            user_count = UserAccount.objects.count()
            
            self.stdout.write(f"📊 Số lượng hiện tại:")
            self.stdout.write(f"  - Sản phẩm: {product_count}")
            self.stdout.write(f"  - Biến thể: {variant_count}")
            self.stdout.write(f"  - Brand: {brand_count}")
            self.stdout.write(f"  - Category: {category_count}")
            self.stdout.write(f"  - Attribute Values: {attr_value_count}")
            self.stdout.write(f"  - User: {user_count}")
            
            if product_count > 0:
                last_product = Product.objects.last()
                self.stdout.write(f"  - Sản phẩm cuối cùng: ID {last_product.id}")
            
            return True
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Lỗi khi kiểm tra dữ liệu: {e}"))
            return False

    def create_sample_products(self, num_products=20):
        """Tạo dữ liệu sản phẩm mẫu"""
        self.stdout.write(f"=== TẠO {num_products} SẢN PHẨM MẪU ===")
        
        # Lấy user đầu tiên làm created_by
        try:
            user = UserAccount.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR("❌ Không tìm thấy user nào. Vui lòng tạo user trước."))
                return []
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Lỗi khi lấy user: {e}"))
            return []
        
        # Lấy danh sách brand và category
        try:
            brands = list(Brand.objects.values_list('id', flat=True))
            categories = list(Category.objects.values_list('id', flat=True))
            attribute_values = list(AttributeValue.objects.values_list('id', flat=True))
            
            if not brands:
                self.stdout.write(self.style.ERROR("❌ Không tìm thấy brand nào. Vui lòng tạo brand trước."))
                return []
            if not categories:
                self.stdout.write(self.style.ERROR("❌ Không tìm thấy category nào. Vui lòng tạo category trước."))
                return []
            if not attribute_values:
                self.stdout.write(self.style.ERROR("❌ Không tìm thấy attribute value nào. Vui lòng tạo attribute values trước."))
                return []
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Lỗi khi lấy dữ liệu: {e}"))
            return []
        
        created_products = []
        
        for i in range(num_products):
            try:
                # Tạo tên sản phẩm
                name = generate_product_name()
                slug = generate_slug(name)
                
                # Kiểm tra slug đã tồn tại chưa
                while Product.objects.filter(slug=slug).exists():
                    name = generate_product_name()
                    slug = generate_slug(name)
                
                # Tạo sản phẩm
                product = Product.objects.create(
                    name=name,
                    description=f"Mô tả cho sản phẩm {name}",
                    brand_id=random.choice(brands),
                    category_id=random.choice(categories),
                    base_price=generate_base_price(),
                    warranty_period=random.choice([12, 24, 36, 60]),
                    slug=slug,
                    meta_title=f"Meta title cho {name}",
                    meta_description=f"Meta description cho {name}",
                    is_featured=random.choice([True, False]),
                    is_active=True,
                    created_by=user,
                    updated_by=user
                )
                
                created_products.append(product)
                self.stdout.write(f"✅ Đã tạo sản phẩm: {name} (ID: {product.id})")
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Lỗi khi tạo sản phẩm {i+1}: {e}"))
                continue
        
        self.stdout.write(f"\n🎉 Hoàn thành! Đã tạo {len(created_products)} sản phẩm")
        return created_products

    def create_sample_variants(self, products, variants_per_product=3):
        """Tạo biến thể cho các sản phẩm"""
        self.stdout.write(f"\n=== TẠO BIẾN THỂ ({variants_per_product} biến thể/sản phẩm) ===")
        
        # Lấy user đầu tiên làm created_by
        try:
            user = UserAccount.objects.first()
            attribute_values = list(AttributeValue.objects.values_list('id', flat=True))
            
            if not attribute_values:
                self.stdout.write(self.style.ERROR("❌ Không tìm thấy attribute value nào."))
                return
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Lỗi khi lấy dữ liệu: {e}"))
            return
        
        total_variants = 0
        
        for product in products:
            self.stdout.write(f"\n📦 Tạo biến thể cho sản phẩm: {product.name}")
            
            for i in range(variants_per_product):
                try:
                    # Tạo SKU
                    sku = f"{product.slug.upper()}-VAR-{i+1:02d}"
                    
                    # Chọn ngẫu nhiên 2-4 attribute values
                    num_attrs = random.randint(2, 4)
                    selected_attrs = random.sample(attribute_values, min(num_attrs, len(attribute_values)))
                    
                    # Tạo biến thể
                    variant = ProductVariant.objects.create(
                        product=product,
                        sku=sku,
                        price_adjustment=generate_price_adjustment(),
                        stock_alert_threshold=random.randint(5, 20),
                        barcode=f"BAR{product.id:04d}{i+1:02d}",
                        is_active=True,
                        weight=Decimal(str(random.randint(50, 500))),
                        dimensions=f"{random.randint(30,50)}x{random.randint(20,40)}x{random.randint(8,15)}",
                        warranty_period=random.choice([None, 12, 24, 36]),
                        created_by=user,
                        updated_by=user
                    )
                    
                    # Thêm attribute values
                    variant.attribute_values.set(selected_attrs)
                    
                    total_variants += 1
                    self.stdout.write(f"  ✅ Biến thể {i+1}: {sku} (Attributes: {len(selected_attrs)})")
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  ❌ Lỗi khi tạo biến thể {i+1}: {e}"))
                    continue
        
        self.stdout.write(f"\n🎉 Hoàn thành! Đã tạo {total_variants} biến thể") 