import requests
import json

# Cấu hình
base_url = "http://localhost:8000"

def test_warranty_detail():
    print("=== Testing Warranty Detail API ===\n")
    
    # 1. Lấy danh sách warranty để có ID
    print("1. Getting warranty list to get an ID...")
    response = requests.get(f"{base_url}/api/warranties/")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        warranties = response.json()
        if warranties and 'results' in warranties and warranties['results']:
            warranty_id = warranties['results'][0]['id']
            print(f"Found warranty ID: {warranty_id}")
            
            # 2. Lấy chi tiết warranty
            print(f"\n2. Testing GET /api/warranties/{warranty_id}/")
            response = requests.get(f"{base_url}/api/warranties/{warranty_id}/")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                warranty_detail = response.json()
                print("✓ Warranty detail API working correctly")
                print("\nResponse structure:")
                print(json.dumps(warranty_detail, indent=2, ensure_ascii=False))
            else:
                print(f"✗ API error: {response.text}")
        else:
            print("No warranties found in the list")
    else:
        print(f"✗ API error: {response.text}")

if __name__ == "__main__":
    test_warranty_detail() 