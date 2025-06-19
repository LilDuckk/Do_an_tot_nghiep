from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.stores.models.supplier import Supplier
from apps.stores.serializers.supplier_serializer import SupplierSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý nhà cung cấp
    """
    queryset = Supplier.objects.filter(is_deleted=False)
    serializer_class = SupplierSerializer
    permission_classes = [IsSuperUser, IsStoreEmployee]
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
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết nhà cung cấp
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """
        Lấy tất cả nhà cung cấp (không phân trang) - chỉ lấy những nhà cung cấp chưa bị xóa mềm
        """
        queryset = Supplier.objects.filter(is_deleted=False)  # Lọc xóa mềm
        
        # Áp dụng các filter, search, ordering
        queryset = self.filter_queryset(queryset)
        
        # Không phân trang, trả về tất cả dữ liệu
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 