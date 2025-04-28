from rest_framework import serializers
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer

class ReturnOrderSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    return_order_details = ReturnOrderDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = ReturnOrder
        fields = ['id', 'order', 'return_number', 'status', 'reason',
                 'return_order_details', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 