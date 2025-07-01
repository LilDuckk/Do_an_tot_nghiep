from rest_framework import viewsets
from django_filters import rest_framework as filters
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.inventory_transaction_serializer import (
    InventoryTransactionSerializer, 
    InventoryTransactionCreateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class InventoryTransactionFilter(filters.FilterSet):
    # Filter transaction_type không phân biệt chữ hoa chữ thường
    transaction_type = filters.CharFilter(lookup_expr='iexact')
    
    # Filter reference_type không phân biệt chữ hoa chữ thường
    reference_type = filters.CharFilter(lookup_expr='iexact')
    
    # Filter theo tên sản phẩm
    product_name = filters.CharFilter(field_name='inventory__product_variant__product__name', lookup_expr='icontains')
    
    # Filter theo SKU của product variant
    product_sku = filters.CharFilter(field_name='inventory__product_variant__sku', lookup_expr='icontains')
    
    # Filter theo tên cửa hàng
    store_name = filters.CharFilter(field_name='inventory__store__name', lookup_expr='icontains')
    
    # Filter theo reference_id
    reference_id = filters.NumberFilter()
    
    # Filter theo ngày tạo
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'transaction_type', 'reference_type', 'reference_id',
            'inventory__product_variant__product__name', 'inventory__product_variant__sku',
            'inventory__store__name', 'created_at'
        ]

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filterset_class = InventoryTransactionFilter
    search_fields = ['reference_id', 'note']
    ordering_fields = ['created_at', 'transaction_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """
        Sử dụng serializer khác nhau cho từng action
        """
        if self.action in ['create']:
            return InventoryTransactionCreateSerializer
        return InventoryTransactionSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết giao dịch tồn kho
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions() 