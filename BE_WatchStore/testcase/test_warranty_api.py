#!/usr/bin/env python
"""
Test script để kiểm tra API warranty
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_warranty_api():
    """Test các API warranty"""
    base_url = "http://localhost:8000/api"
    
    print("=== Testing Warranty API ===")
    
    # Test 1: Lấy danh sách warranty
    print("\n1. Testing GET /api/warranties/")
    try:
        response = requests.get(f"{base_url}/warranties/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total warranties: {data.get('count', 0)}")
            print("✓ API working correctly")
        else:
            print(f"✗ API error: {response.text}")
    except Exception as e:
        print(f"✗ Connection error: {str(e)}")
    
    # Test 2: Lấy thống kê warranty
    print("\n2. Testing GET /api/warranties/statistics/")
    try:
        response = requests.get(f"{base_url}/warranties/statistics/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total warranties: {data.get('total_warranties', 0)}")
            print(f"Active warranties: {data.get('active_warranties', 0)}")
            print("✓ Statistics API working correctly")
        else:
            print(f"✗ API error: {response.text}")
    except Exception as e:
        print(f"✗ Connection error: {str(e)}")
    
    # Test 3: Lấy warranty active
    print("\n3. Testing GET /api/warranties/active_warranties/")
    try:
        response = requests.get(f"{base_url}/warranties/active_warranties/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Active warranties: {len(data)}")
            print("✓ Active warranties API working correctly")
        else:
            print(f"✗ API error: {response.text}")
    except Exception as e:
        print(f"✗ Connection error: {str(e)}")
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    test_warranty_api() 