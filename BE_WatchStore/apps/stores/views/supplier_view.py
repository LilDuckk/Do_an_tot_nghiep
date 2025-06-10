from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.stores.models.supplier import Supplier
from apps.stores.serializers.supplier_serializer import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý nhà cung cấp
    """
    queryset = Supplier.objects.filter(is_deleted=False)
    serializer_class = SupplierSerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Các trường có thể lọc
    filterset_fields = ['is_active']
    
    # Các trường có thể tìm kiếm
    search_fields = ['name', 'contact_person', 'email', 'phone', 'tax_code']
    
    # Các trường có thể sắp xếp
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']  # Mặc định sắp xếp theo thời gian tạo mới nhất 