from rest_framework import viewsets
from apps.orders.models.order import Orders
from apps.orders.serializers.order_serializer import OrderSerializer
from rest_framework.permissions import DjangoModelPermissions

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['user', 'status', 'payment_method']
    search_fields = ['order_number']
    ordering_fields = ['order_number', 'created_at']
    ordering = ['-created_at'] 