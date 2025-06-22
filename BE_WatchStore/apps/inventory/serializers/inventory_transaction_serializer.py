from rest_framework import serializers
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer

class InventoryTransactionSerializer(serializers.ModelSerializer):
    # Thông tin sản phẩm từ inventory
    product_variant_info = ProductVariantSerializer(source='inventory.product_variant', read_only=True)
    product_info = ProductSerializer(source='inventory.product_variant.product', read_only=True)
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'inventory', 'product_variant_info', 'product_info',
            'transaction_type', 'quantity', 'unit_price', 'reference_id', 
            'reference_type', 'note', 'transaction_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')


class InventoryTransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc tạo mới InventoryTransaction
    """
    class Meta:
        model = InventoryTransaction
        fields = [
            'inventory', 'transaction_type', 'quantity', 'unit_price',
            'reference_id', 'reference_type', 'note', 'transaction_date'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra số lượng
        if data['quantity'] <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        
        # Kiểm tra loại giao dịch
        valid_types = ['in', 'out', 'adjustment']
        if data['transaction_type'] not in valid_types:
            raise serializers.ValidationError(f"Loại giao dịch phải là một trong: {', '.join(valid_types)}")
        
        # Kiểm tra đơn giá
        if data.get('unit_price', 0) < 0:
            raise serializers.ValidationError("Đơn giá không được âm")
        
        return data 