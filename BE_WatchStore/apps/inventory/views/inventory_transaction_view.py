from rest_framework import viewsets
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.inventory_transaction_serializer import (
    InventoryTransactionSerializer, 
    InventoryTransactionCreateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filterset_fields = [
        'transaction_type', 'reference_type', 'inventory__product_variant__product__name'
    ]
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