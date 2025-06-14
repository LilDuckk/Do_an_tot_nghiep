from rest_framework import viewsets
from apps.inventory.models.stock_take import StockTake
from apps.inventory.serializers.stock_take_serializer import StockTakeSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class StockTakeViewSet(viewsets.ModelViewSet):
    queryset = StockTake.objects.all()
    serializer_class = StockTakeSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết kiểm kê
            return [IsAuthenticated()]
        return super().get_permissions() 