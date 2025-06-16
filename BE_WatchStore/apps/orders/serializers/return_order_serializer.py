from rest_framework import serializers
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer

class ReturnOrderSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    return_order_details = ReturnOrderDetailSerializer(many=True, read_only=True)
    refund_amount = serializers.DecimalField(max_digits=25, decimal_places=2, required=False, allow_null=True)
    
    class Meta:
        model = ReturnOrder
        fields = ['id', 'order', 'return_number', 'status', 'reason',
                 'return_order_details', 'refund_amount', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 