#!/usr/bin/env python3
"""
Debug script để kiểm tra URL patterns
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import reverse, get_resolver
from django.urls.resolvers import URLPattern, URLResolver
from rest_framework.routers import DefaultRouter

def print_url_patterns(urlpatterns, level=0):
    """In ra tất cả URL patterns"""
    indent = "  " * level
    
    for pattern in urlpatterns:
        if isinstance(pattern, URLPattern):
            print(f"{indent}URL: {pattern.pattern} -> {pattern.callback.__name__ if hasattr(pattern.callback, '__name__') else str(pattern.callback)}")
        elif isinstance(pattern, URLResolver):
            print(f"{indent}Resolver: {pattern.pattern}")
            print_url_patterns(pattern.url_patterns, level + 1)

def check_inventory_urls():
    """Kiểm tra URL patterns của inventory"""
    print("=== DEBUG INVENTORY URLS ===")
    
    # Import inventory URLs
    try:
        from apps.inventory.urls import urlpatterns
        print("✅ Inventory URLs imported successfully")
        print(f"Number of URL patterns: {len(urlpatterns)}")
        
        for pattern in urlpatterns:
            print(f"Pattern: {pattern}")
            if hasattr(pattern, 'url_patterns'):
                print(f"  Sub-patterns: {len(pattern.url_patterns)}")
                for sub_pattern in pattern.url_patterns:
                    print(f"    - {sub_pattern}")
        
    except Exception as e:
        print(f"❌ Error importing inventory URLs: {e}")
        return False
    
    return True

def check_router_registration():
    """Kiểm tra router registration"""
    print("\n=== DEBUG ROUTER REGISTRATION ===")
    
    try:
        from apps.inventory.urls import router
        print("✅ Router imported successfully")
        print(f"Number of registered viewsets: {len(router.registry)}")
        
        for prefix, viewset, basename in router.registry:
            print(f"  - {prefix} -> {viewset.__name__}")
            
            # Kiểm tra các actions có sẵn
            if hasattr(viewset, 'get_extra_actions'):
                extra_actions = viewset.get_extra_actions()
                if extra_actions:
                    print(f"    Extra actions: {[action.url_name for action in extra_actions]}")
        
    except Exception as e:
        print(f"❌ Error checking router: {e}")
        return False
    
    return True

def test_url_reverse():
    """Test URL reverse"""
    print("\n=== DEBUG URL REVERSE ===")
    
    try:
        # Test các URL patterns với namespace đúng
        urls_to_test = [
            'stocktransferdetail-list',
            'stocktransferdetail-detail',
            'stocktransfer-list',
            'inventory-list',
        ]
        
        for url_name in urls_to_test:
            try:
                url = reverse(f'inventory:{url_name}')
                print(f"✅ {url_name} -> {url}")
            except Exception as e:
                print(f"❌ {url_name} -> Error: {e}")
        
        # Test URL trực tiếp
        print("\n=== TEST DIRECT URL PATTERNS ===")
        from apps.inventory.urls import urlpatterns
        for pattern in urlpatterns:
            if hasattr(pattern, 'url_patterns'):
                for sub_pattern in pattern.url_patterns:
                    if 'stock-transfer-details' in str(sub_pattern):
                        print(f"✅ Found stock-transfer-details URL: {sub_pattern}")
        
    except Exception as e:
        print(f"❌ Error in URL reverse test: {e}")
        return False
    
    return True

def check_viewset_methods():
    """Kiểm tra methods của ViewSet"""
    print("\n=== DEBUG VIEWSET METHODS ===")
    
    try:
        from apps.inventory.views.stock_transfer_detail_view import StockTransferDetailViewSet
        
        viewset = StockTransferDetailViewSet()
        print(f"✅ StockTransferDetailViewSet imported")
        print(f"  - queryset: {viewset.queryset.model.__name__}")
        print(f"  - serializer_class: {viewset.serializer_class.__name__}")
        
        # Kiểm tra các methods có sẵn
        methods = ['list', 'create', 'retrieve', 'update', 'partial_update', 'destroy']
        for method in methods:
            if hasattr(viewset, method):
                print(f"  ✅ {method} method available")
            else:
                print(f"  ❌ {method} method missing")
        
    except Exception as e:
        print(f"❌ Error checking ViewSet: {e}")
        return False
    
    return True

def test_actual_urls():
    """Test URLs thực tế"""
    print("\n=== TEST ACTUAL URLs ===")
    
    try:
        # Test URL patterns thực tế
        from apps.inventory.urls import urlpatterns
        
        for pattern in urlpatterns:
            if hasattr(pattern, 'url_patterns'):
                for sub_pattern in pattern.url_patterns:
                    if 'stock-transfer-details' in str(sub_pattern):
                        print(f"✅ Stock Transfer Details URL: {sub_pattern.pattern}")
                        print(f"   Name: {sub_pattern.name}")
                        print(f"   Callback: {sub_pattern.callback}")
                        
                        # Test HTTP methods
                        if hasattr(sub_pattern.callback, 'actions'):
                            print(f"   HTTP Methods: {list(sub_pattern.callback.actions.keys())}")
        
    except Exception as e:
        print(f"❌ Error testing actual URLs: {e}")
        return False
    
    return True

def main():
    """Chạy tất cả debug tests"""
    print("INVENTORY URLS DEBUG")
    print("=" * 50)
    
    # Chạy các tests
    check_inventory_urls()
    check_router_registration()
    test_url_reverse()
    check_viewset_methods()
    test_actual_urls()
    
    print("\n" + "=" * 50)
    print("DEBUG COMPLETED")

if __name__ == "__main__":
    main() 