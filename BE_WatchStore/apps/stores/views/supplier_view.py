from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.stores.models.supplier import Supplier
from apps.stores.serializers.supplier_serializer import SupplierSerializer
from apps.core.utils.permissions import IsAdminUser

class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý nhà cung cấp
    """
    queryset = Supplier.objects.filter(is_deleted=False)
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Các trường có thể lọc
    filterset_fields = ['is_active']
    
    # Các trường có thể tìm kiếm
    search_fields = ['name', 'contact_person', 'email', 'phone', 'tax_code']
    
    # Các trường có thể sắp xếp
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']  # Mặc định sắp xếp theo thời gian tạo mới nhất

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết nhà cung cấp
            return [IsAuthenticated()]
        return super().get_permissions() 