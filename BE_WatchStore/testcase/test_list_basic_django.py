import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product
from apps.products.serializers.product_serializer import ProductBasicSerializer
from django.db.models import Q
import json

def test_list_basic_logic():
    """
    Test logic của API list_basic trực tiếp
    """
    # Test 1: Lấy tất cả sản phẩm cơ bản
    print("=== Test 1: Lấy tất cả sản phẩm cơ bản ===")
    queryset = Product.objects.filter(
        is_deleted=False,
        is_active=True
    ).select_related('brand', 'category').prefetch_related(
        'images',
        'variants'
    ).order_by('-is_featured', '-created_at')
    
    print(f"Tổng số sản phẩm active: {queryset.count()}")
    
    # Lấy 5 sản phẩm đầu tiên
    products = queryset[:5]
    serializer = ProductBasicSerializer(products, many=True)
    data = serializer.data
    
    print(f"Số sản phẩm được serialize: {len(data)}")
    if data:
        print("Sản phẩm đầu tiên:")
        product = data[0]
        print(f"  - ID: {product.get('id')}")
        print(f"  - Tên: {product.get('name')}")
        print(f"  - Featured: {product.get('is_featured')}")
        print(f"  - Ảnh: {product.get('primary_image')}")
        print(f"  - Giá: {product.get('price_range')}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Lọc theo category
    print("=== Test 2: Lọc theo category ===")
    category_products = queryset.filter(category_id=1)
    print(f"Số sản phẩm trong category 1: {category_products.count()}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Lọc theo brand
    print("=== Test 3: Lọc theo brand ===")
    brand_products = queryset.filter(brand_id=1)
    print(f"Số sản phẩm trong brand 1: {brand_products.count()}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 4: Tìm kiếm
    print("=== Test 4: Tìm kiếm ===")
    search_products = queryset.filter(
        Q(name__icontains='Rolex') | 
        Q(description__icontains='Rolex') |
        Q(brand__name__icontains='Rolex') |
        Q(category__name__icontains='Rolex')
    )
    print(f"Số sản phẩm tìm thấy với 'Rolex': {search_products.count()}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 5: Chỉ lấy sản phẩm featured
    print("=== Test 5: Chỉ lấy sản phẩm featured ===")
    featured_products = queryset.filter(is_featured=True)
    print(f"Số sản phẩm featured: {featured_products.count()}")
    
    if featured_products.exists():
        serializer = ProductBasicSerializer(featured_products[:3], many=True)
        data = serializer.data
        print("3 sản phẩm featured đầu tiên:")
        for i, product in enumerate(data):
            print(f"  {i+1}. {product.get('name')} (Featured: {product.get('is_featured')})")
    
    print("\n" + "="*50 + "\n")
    
    # Test 6: Kiểm tra sắp xếp (featured trước)
    print("=== Test 6: Kiểm tra sắp xếp (featured trước) ===")
    ordered_products = queryset[:10]
    serializer = ProductBasicSerializer(ordered_products, many=True)
    data = serializer.data
    
    print("10 sản phẩm đầu tiên (theo thứ tự featured):")
    for i, product in enumerate(data):
        print(f"  {i+1}. {product.get('name')} (Featured: {product.get('is_featured')})")
    
    print("\n" + "="*50 + "\n")
    
    # Test 7: Lọc theo giá
    print("=== Test 7: Lọc theo giá ===")
    price_products = queryset.filter(
        base_price__gte=1000000,
        base_price__lte=5000000
    )
    print(f"Số sản phẩm trong khoảng giá 1M-5M: {price_products.count()}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 8: Thống kê tổng quan
    print("=== Test 8: Thống kê tổng quan ===")
    total_active = Product.objects.filter(is_deleted=False, is_active=True).count()
    total_featured = Product.objects.filter(is_deleted=False, is_active=True, is_featured=True).count()
    total_inactive = Product.objects.filter(is_deleted=False, is_active=False).count()
    
    print(f"Tổng sản phẩm active: {total_active}")
    print(f"Tổng sản phẩm featured: {total_featured}")
    print(f"Tổng sản phẩm inactive: {total_inactive}")
    print(f"Tỷ lệ featured: {total_featured/total_active*100:.1f}%" if total_active > 0 else "Tỷ lệ featured: 0%")

if __name__ == "__main__":
    test_list_basic_logic() 