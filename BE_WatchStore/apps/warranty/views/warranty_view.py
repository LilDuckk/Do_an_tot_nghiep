from rest_framework import viewsets
from apps.warranty.models.warranty import Warranty
from apps.warranty.serializers.warranty_serializer import WarrantySerializer
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.permissions import IsAdminUser

class WarrantyViewSet(viewsets.ModelViewSet):
    queryset = Warranty.objects.all()
    serializer_class = WarrantySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant', 'status']
    search_fields = ['warranty_number']
    ordering_fields = ['warranty_number', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết bảo hành
            return [IsAuthenticated()]
        return super().get_permissions() 