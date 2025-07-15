import requests
import json

# Test API Category
base_url = "http://localhost:8000"

def test_category_api():
    # Test GET categories
    print("=== Testing Category API ===")
    
    # Get all categories
    response = requests.get(f"{base_url}/api/products/categories/")
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ GET /api/products/categories/ - Success ({len(categories)} categories)")
        
        # Hiển thị 5 categories đầu tiên làm ví dụ
        print("\n📋 Ví dụ dữ liệu categories:")
        for i, category in enumerate(categories[:5]):
            print(f"Category {i+1}:")
            print(f"  - ID: {category.get('id')}")
            print(f"  - Name: {category.get('name')}")
            print(f"  - Parent ID: {category.get('parent')}")
            print(f"  - Parent Name: {category.get('parent_name')}")
            print(f"  - Is Active: {category.get('is_active')}")
            print(f"  - Slug: {category.get('slug')}")
            print(f"  - Description: {category.get('description')}")
            print()
    else:
        print(f"❌ GET /api/products/categories/ - Failed: {response.status_code}")
        print(response.text)
        return
    
    # Test GET single category
    if categories:
        category_id = categories[0]['id']
        response = requests.get(f"{base_url}/api/products/categories/{category_id}/")
        if response.status_code == 200:
            category = response.json()
            print(f"✅ GET /api/products/categories/{category_id}/ - Success")
            print(f"📋 Chi tiết category:")
            print(f"  - ID: {category.get('id')}")
            print(f"  - Name: {category.get('name')}")
            print(f"  - Parent ID: {category.get('parent')}")
            print(f"  - Parent Name: {category.get('parent_name')}")
            print(f"  - Is Active: {category.get('is_active')}")
            print(f"  - Slug: {category.get('slug')}")
            print(f"  - Description: {category.get('description')}")
        else:
            print(f"❌ GET /api/products/categories/{category_id}/ - Failed: {response.status_code}")

if __name__ == "__main__":
    test_category_api() 