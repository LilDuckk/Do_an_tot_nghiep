import requests
import json

def test_list_basic_api():
    """
    Test API list_basic để liệt kê sản phẩm với thông tin cơ bản
    """
    base_url = "http://localhost:8000/api/products/"
    
    # Test 1: Lấy tất cả sản phẩm cơ bản
    print("=== Test 1: Lấy tất cả sản phẩm cơ bản ===")
    response = requests.get(f"{base_url}list_basic/")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Tổng số sản phẩm: {len(data.get('results', data))}")
        if data.get('results'):
            print("Sản phẩm đầu tiên:")
            print(json.dumps(data['results'][0], indent=2, ensure_ascii=False))
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Phân trang
    print("=== Test 2: Phân trang ===")
    response = requests.get(f"{base_url}list_basic/?page=1&page_size=5")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Page: {data.get('page', 'N/A')}")
        print(f"Page Size: {data.get('page_size', 'N/A')}")
        print(f"Total Count: {data.get('count', 'N/A')}")
        print(f"Results Count: {len(data.get('results', []))}")
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Lọc theo category
    print("=== Test 3: Lọc theo category ===")
    response = requests.get(f"{base_url}list_basic/?category=1")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Số sản phẩm trong category 1: {len(data.get('results', data))}")
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 4: Lọc theo brand
    print("=== Test 4: Lọc theo brand ===")
    response = requests.get(f"{base_url}list_basic/?brand=1")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Số sản phẩm trong brand 1: {len(data.get('results', data))}")
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 5: Tìm kiếm
    print("=== Test 5: Tìm kiếm ===")
    response = requests.get(f"{base_url}list_basic/?search=Rolex")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Số sản phẩm tìm thấy: {len(data.get('results', data))}")
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 6: Lọc theo giá
    print("=== Test 6: Lọc theo giá ===")
    response = requests.get(f"{base_url}list_basic/?min_price=1000000&max_price=5000000")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Số sản phẩm trong khoảng giá: {len(data.get('results', data))}")
    else:
        print(f"Error: {response.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 7: Chỉ lấy sản phẩm featured
    print("=== Test 7: Chỉ lấy sản phẩm featured ===")
    response = requests.get(f"{base_url}list_basic/?featured=true")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Số sản phẩm featured: {len(data.get('results', data))}")
        if data.get('results'):
            print("Sản phẩm featured đầu tiên:")
            print(json.dumps(data['results'][0], indent=2, ensure_ascii=False))
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_list_basic_api() 