from rest_framework import viewsets
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.serializers.warranty_claim_serializer import WarrantyClaimSerializer
from apps.core.utils import IsAdminUser

class WarrantyClaimViewSet(viewsets.ModelViewSet):
    queryset = WarrantyClaim.objects.all()
    serializer_class = WarrantyClaimSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['warranty', 'status']
    search_fields = ['claim_number']
    ordering_fields = ['claim_number', 'created_at']
    ordering = ['-created_at'] 