from rest_framework import viewsets
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.core.utils import IsAdminUser

class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['order', 'product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 