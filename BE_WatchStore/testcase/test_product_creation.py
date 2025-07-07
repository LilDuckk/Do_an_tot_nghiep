#!/usr/bin/env python
"""
Test script để kiểm tra việc tạo sản phẩm
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models.product import Product
from apps.products.models.attribute import AttributeValue, AttributeType
from apps.products.services import ProductService

def test_product_creation():
    """Test tạo sản phẩm với variants"""
    print("=== Testing Product Creation ===")
    
    try:
        # Lấy một số attribute values để test
        attr_values = AttributeValue.objects.filter(is_deleted=False)[:6]
        if len(attr_values) < 6:
            print("Không đủ attribute values để test")
            return
        
        # Lấy category và brand để test
        from apps.products.models.category import Category
        from apps.products.models.brand import Brand
        
        category = Category.objects.filter(is_deleted=False).first()
        brand = Brand.objects.filter(is_deleted=False).first()
        
        if not category or not brand:
            print("Không có category hoặc brand nào để test")
            return
        
        # Tạo product data
        product_data = {
            'name': 'Test Product - Optimized',
            'description': 'Test product created with optimized service',
            'category': category,
            'brand': brand,
            'base_price': 1000000,
            'warranty_period': 12,
            'is_active': True,
            'is_featured': False
        }
        
        # Tạo variants data
        variants_data = [
            {
                'attribute_values': [attr_values[0], attr_values[1]],
                'price_adjustment': 100000,
                'is_active': True
            },
            {
                'attribute_values': [attr_values[2], attr_values[3]],
                'price_adjustment': 200000,
                'is_active': True
            }
        ]
        
        print("Creating product with variants...")
        product, created_variants = ProductService.create_product_with_variants(
            product_data, variants_data
        )
        
        print(f"✅ Product created successfully: {product.name}")
        print(f"✅ Created {len(created_variants)} variants")
        
        for i, variant in enumerate(created_variants):
            print(f"  Variant {i+1}: SKU={variant.sku}, Price={variant.get_final_price()}")
        
        return product, created_variants
        
    except Exception as e:
        print(f"❌ Error creating product: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def test_product_queryset():
    """Test optimized queryset"""
    print("\n=== Testing Optimized Queryset ===")
    
    try:
        # Test với filters
        filters = {
            'is_active': True,
            'search': 'Test'
        }
        
        queryset = ProductService.get_optimized_queryset(filters)
        print(f"✅ Found {queryset.count()} products with filters")
        
        # Test không có filters
        all_products = ProductService.get_optimized_queryset()
        print(f"✅ Found {all_products.count()} total products")
        
    except Exception as e:
        print(f"❌ Error testing queryset: {str(e)}")

def test_variant_operations():
    """Test variant operations"""
    print("\n=== Testing Variant Operations ===")
    
    try:
        # Lấy một product để test
        product = Product.objects.filter(is_deleted=False).first()
        if not product:
            print("Không có product nào để test")
            return
        
        # Test lấy variants
        variants = ProductService.get_variants_for_product(product)
        print(f"✅ Found {variants.count()} variants for product: {product.name}")
        
        # Test lấy attributes
        attributes = ProductService.get_attributes_for_product(product)
        print(f"✅ Found {len(attributes)} attribute types for product")
        
    except Exception as e:
        print(f"❌ Error testing variant operations: {str(e)}")

if __name__ == "__main__":
    print("Starting product creation tests...")
    
    # Test 1: Tạo sản phẩm
    product, variants = test_product_creation()
    
    # Test 2: Queryset optimization
    test_product_queryset()
    
    # Test 3: Variant operations
    test_variant_operations()
    
    print("\n=== Test completed ===") 