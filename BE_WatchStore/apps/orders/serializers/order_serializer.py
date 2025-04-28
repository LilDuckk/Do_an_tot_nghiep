from rest_framework import serializers
from apps.orders.models.order import Order
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.users.serializers.user_serializer import UserSerializer

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'order_number', 'status', 'total_amount',
                 'shipping_address', 'payment_method', 'order_details',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 