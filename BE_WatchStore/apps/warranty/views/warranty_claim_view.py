from rest_framework import viewsets
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.serializers.warranty_claim_serializer import WarrantyClaimSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class WarrantyClaimViewSet(viewsets.ModelViewSet):
    queryset = WarrantyClaim.objects.all()
    serializer_class = WarrantyClaimSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['warranty', 'status']
    search_fields = ['claim_number']
    ordering_fields = ['claim_number', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết yêu cầu bảo hành
            return [IsAuthenticated()]
        return super().get_permissions() 