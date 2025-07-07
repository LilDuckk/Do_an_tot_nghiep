#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.warranty.models.warranty import Warranty
from apps.warranty.serializers.warranty_serializer import WarrantySerializer

def test_warranty_serializer():
    print("=== Testing Warranty Serializer ===\n")
    
    # Lấy warranty đầu tiên
    warranty = Warranty.objects.filter(is_deleted=False).first()
    
    if warranty:
        print(f"Testing warranty ID: {warranty.id}")
        print(f"Warranty number: {warranty.warranty_number}")
        
        # Serialize warranty
        serializer = WarrantySerializer(warranty)
        data = serializer.data
        
        print("\nSerialized data structure:")
        import json
        print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
        
        # Kiểm tra các trường quan trọng
        print("\nChecking important fields:")
        print(f"- id: {data.get('id')}")
        print(f"- warranty_number: {data.get('warranty_number')}")
        print(f"- product: {data.get('product')}")
        print(f"- variant: {data.get('variant')}")
        print(f"- order_detail: {data.get('order_detail')}")
        print(f"- serial_number: {data.get('serial_number')}")
        print(f"- customer_name: {data.get('customer_name')}")
        print(f"- customer_phone: {data.get('customer_phone')}")
        
    else:
        print("No warranties found in database")

if __name__ == "__main__":
    test_warranty_serializer() 