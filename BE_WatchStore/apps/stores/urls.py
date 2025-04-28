from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.stores.views.store_view import StoreViewSet
from apps.stores.views.employee_view import EmployeeViewSet
from apps.stores.views.store_inventory_view import StoreInventoryViewSet

router = DefaultRouter()
router.register(r'stores', StoreViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'store-inventories', StoreInventoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
