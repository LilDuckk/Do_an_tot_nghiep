from rest_framework import viewsets
from apps.orders.models.order import Orders
from apps.orders.serializers.order_serializer import OrderSerializer
from rest_framework.permissions import DjangoModelPermissions
from apps.core.mixins import SoftDeleteMixin
from django_filters import rest_framework as filters

class OrderFilter(filters.FilterSet):
    customer_first_name = filters.CharFilter(field_name='customer__first_name', lookup_expr='icontains')
    
    class Meta:
        model = Orders
        fields = ['customer', 'status', 'payment_method', 'customer_first_name']

class OrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_class = OrderFilter
    search_fields = ['order_number']
    ordering_fields = ['order_number', 'created_at']
    ordering = ['-created_at'] 