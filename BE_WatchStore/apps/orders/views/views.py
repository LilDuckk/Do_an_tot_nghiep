from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Order, OrderDetail, OrderCoupon
from ..serializers import OrderSerializer, OrderDetailSerializer, OrderCouponSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'store', 'employee', 'status', 'payment_status', 'is_online_order']
    search_fields = ['tracking_number', 'shipping_address', 'note']
    ordering_fields = ['order_date', 'total_amount', 'created_at']
    ordering = ['-created_at']

class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'product_variant']
    ordering_fields = ['quantity', 'unit_price', 'created_at']
    ordering = ['-created_at']

class OrderCouponViewSet(viewsets.ModelViewSet):
    queryset = OrderCoupon.objects.all()
    serializer_class = OrderCouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'coupon']
    ordering_fields = ['discount_amount', 'created_at']
    ordering = ['-created_at'] 