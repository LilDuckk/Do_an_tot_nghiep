from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Warranty, WarrantyClaim
from ..serializers import WarrantySerializer, WarrantyClaimSerializer

class WarrantyViewSet(viewsets.ModelViewSet):
    queryset = Warranty.objects.all()
    serializer_class = WarrantySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order_detail', 'status']
    search_fields = ['serial_number']
    ordering_fields = ['warranty_start_date', 'warranty_end_date', 'created_at']
    ordering = ['-created_at']

class WarrantyClaimViewSet(viewsets.ModelViewSet):
    queryset = WarrantyClaim.objects.all()
    serializer_class = WarrantyClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warranty', 'status', 'technician']
    search_fields = ['description', 'resolution']
    ordering_fields = ['claim_date', 'completed_date', 'created_at']
    ordering = ['-created_at'] 