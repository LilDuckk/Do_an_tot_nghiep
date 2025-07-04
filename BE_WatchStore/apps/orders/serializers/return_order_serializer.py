from rest_framework import serializers
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.users.serializers.user_serializer import UserSerializer
from apps.stores.models.store import Store

class ReturnOrderSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    return_store = StoreSerializer(read_only=True)
    return_order_details = ReturnOrderDetailSerializer(many=True, read_only=True)
    approved_by = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    refund_amount = serializers.DecimalField(max_digits=25, decimal_places=2, required=False, allow_null=True)
    
    class Meta:
        model = ReturnOrder
        fields = [
            'id', 'order', 'customer', 'return_store', 'return_number', 
            'return_date', 'status', 'reason', 'refund_amount', 'refund_method',
            'refund_status', 'approved_by', 'approved_date', 'rejection_reason',
            'return_order_details', 'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'return_number', 'approved_date')

class ReturnOrderCreateSerializer(serializers.ModelSerializer):
    return_store = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.all(), 
        required=False, 
        allow_null=True
    )
    
    class Meta:
        model = ReturnOrder
        fields = [
            'order', 'customer', 'return_store', 'reason', 'refund_method'
        ]
    
    def validate(self, data):
        order = data.get('order')
        return_store = data.get('return_store')
        
        # Nếu không có return_store, mặc định là store của order
        if not return_store and order:
            data['return_store'] = order.store
        
        return data 