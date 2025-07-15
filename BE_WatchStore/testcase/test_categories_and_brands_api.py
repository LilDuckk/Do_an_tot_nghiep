#!/usr/bin/env python
"""
Test script cho API lấy danh sách thương hiệu và danh mục
"""
import os
import sys
import django

# Thêm đường dẫn project vào sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cấu hình Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models.brand import Brand
from apps.products.models.category import Category

def test_categories_and_brands_api():
    """Test API lấy cả danh sách thương hiệu và danh mục"""
    
    # Tạo client với cấu hình test
    client = APIClient()
    client.defaults['HTTP_HOST'] = 'localhost'
    
    # URL của API
    url = '/api/products/brands/categories-and-brands/'
    
    print(f"Testing API: {url}")
    
    # Gọi API
    response = client.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        data = response.data
        print(f"Response data: {data}")
        
        # Kiểm tra cấu trúc response
        if 'brands' in data and 'categories' in data:
            print(f"✅ API trả về đúng cấu trúc")
            print(f"📊 Số lượng thương hiệu: {len(data['brands'])}")
            print(f"📊 Số lượng danh mục: {len(data['categories'])}")
            
            # Kiểm tra dữ liệu thương hiệu
            if data['brands']:
                brand = data['brands'][0]
                print(f"📋 Mẫu thương hiệu: {brand}")
                required_fields = ['id', 'name', 'slug']
                if all(field in brand for field in required_fields):
                    print(f"✅ Thương hiệu có đủ các trường: {required_fields}")
                else:
                    print(f"❌ Thương hiệu thiếu trường: {[f for f in required_fields if f not in brand]}")
            
            # Kiểm tra dữ liệu danh mục
            if data['categories']:
                category = data['categories'][0]
                print(f"📋 Mẫu danh mục: {category}")
                required_fields = ['id', 'name', 'slug', 'parent']
                if all(field in category for field in required_fields):
                    print(f"✅ Danh mục có đủ các trường: {required_fields}")
                else:
                    print(f"❌ Danh mục thiếu trường: {[f for f in required_fields if f not in category]}")
        else:
            print(f"❌ API không trả về đúng cấu trúc")
    else:
        print(f"❌ API trả về lỗi: {response.status_code}")
        try:
            print(f"Response: {response.data}")
        except:
            print(f"Response content: {response.content.decode()}")

def test_individual_apis():
    """Test các API riêng lẻ"""
    
    client = APIClient()
    client.defaults['HTTP_HOST'] = 'localhost'
    
    # Test API thương hiệu active
    print("\n🔍 Testing Brand Active API...")
    brand_url = '/api/products/brands/active/'
    brand_response = client.get(brand_url)
    print(f"Brand API Status: {brand_response.status_code}")
    if brand_response.status_code == status.HTTP_200_OK:
        print(f"Brands count: {len(brand_response.data)}")
    
    # Test API danh mục active
    print("\n🔍 Testing Category Active API...")
    category_url = '/api/products/categories/active/'
    category_response = client.get(category_url)
    print(f"Category API Status: {category_response.status_code}")
    if category_response.status_code == status.HTTP_200_OK:
        print(f"Categories count: {len(category_response.data)}")

def test_direct_model_access():
    """Test truy cập trực tiếp model để kiểm tra dữ liệu"""
    print("\n🔍 Testing Direct Model Access...")
    
    # Kiểm tra thương hiệu active
    brands = Brand.objects.filter(is_active=True).order_by('display_order', 'name').values('id', 'name', 'slug')
    print(f"Active brands count: {brands.count()}")
    if brands.exists():
        print(f"Sample brand: {brands.first()}")
    
    # Kiểm tra danh mục active
    categories = Category.objects.filter(is_active=True).order_by('display_order', 'name').values('id', 'name', 'slug', 'parent')
    print(f"Active categories count: {categories.count()}")
    if categories.exists():
        print(f"Sample category: {categories.first()}")

if __name__ == '__main__':
    print("🚀 Bắt đầu test API Categories and Brands...")
    
    # Test truy cập trực tiếp model trước
    test_direct_model_access()
    
    # Test API kết hợp
    test_categories_and_brands_api()
    
    # Test các API riêng lẻ
    test_individual_apis()
    
    print("\n✅ Hoàn thành test!") 