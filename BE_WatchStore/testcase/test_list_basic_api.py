#!/usr/bin/env python
"""
Test script cho API list_basic
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

def test_list_basic_api():
    """Test API list_basic"""
    
    # Tạo client với cấu hình test
    client = APIClient()
    client.defaults['HTTP_HOST'] = 'localhost'
    
    # URL của API
    url = '/api/products/products/list_basic/'
    
    print(f"Testing API: {url}")
    
    # Test 1: Gọi API cơ bản
    print("\n🔍 Test 1: Gọi API cơ bản")
    response = client.get(url)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        data = response.data
        print(f"✅ API hoạt động bình thường")
        print(f"📊 Số lượng sản phẩm: {len(data.get('results', []))}")
        print(f"📊 Tổng số sản phẩm: {data.get('count', 0)}")
        
        # Kiểm tra cấu trúc response
        if 'results' in data and 'count' in data:
            print(f"✅ Cấu trúc response đúng")
            
            # Kiểm tra dữ liệu sản phẩm đầu tiên
            if data['results']:
                product = data['results'][0]
                print(f"📋 Mẫu sản phẩm: {product}")
                
                required_fields = ['id', 'name', 'slug', 'primary_image', 'price_range', 'is_featured']
                if all(field in product for field in required_fields):
                    print(f"✅ Sản phẩm có đủ các trường: {required_fields}")
                else:
                    print(f"❌ Sản phẩm thiếu trường: {[f for f in required_fields if f not in product]}")
        else:
            print(f"❌ Cấu trúc response không đúng")
    else:
        print(f"❌ API trả về lỗi: {response.status_code}")
        try:
            print(f"Response: {response.data}")
        except:
            print(f"Response content: {response.content.decode()}")
    
    # Test 2: Gọi API với filter is_active=true
    print("\n🔍 Test 2: Gọi API với filter is_active=true")
    response = client.get(f"{url}?is_active=true")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        data = response.data
        print(f"✅ API với filter hoạt động bình thường")
        print(f"📊 Số lượng sản phẩm active: {len(data.get('results', []))}")
    
    # Test 3: Gọi API với phân trang
    print("\n🔍 Test 3: Gọi API với phân trang")
    response = client.get(f"{url}?page=1&page_size=5")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        data = response.data
        print(f"✅ API phân trang hoạt động bình thường")
        print(f"📊 Số lượng sản phẩm trên trang: {len(data.get('results', []))}")
        print(f"📊 Tổng số sản phẩm: {data.get('count', 0)}")
        print(f"📊 Có trang tiếp theo: {data.get('next') is not None}")
    
    # Test 4: Gọi API với filter featured
    print("\n🔍 Test 4: Gọi API với filter featured")
    response = client.get(f"{url}?featured=true")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == status.HTTP_200_OK:
        data = response.data
        print(f"✅ API featured filter hoạt động bình thường")
        print(f"📊 Số lượng sản phẩm featured: {len(data.get('results', []))}")
        
        # Kiểm tra tất cả sản phẩm đều là featured
        if data['results']:
            all_featured = all(product.get('is_featured', False) for product in data['results'])
            print(f"✅ Tất cả sản phẩm đều là featured: {all_featured}")

if __name__ == '__main__':
    print("🚀 Bắt đầu test API list_basic...")
    
    test_list_basic_api()
    
    print("\n✅ Hoàn thành test!") 