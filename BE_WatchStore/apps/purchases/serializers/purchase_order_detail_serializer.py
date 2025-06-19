from rest_framework import serializers
from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.products.serializers.product_serializer import ProductVariantSerializer


class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    """
    Serializer cho PurchaseOrderDetail
    """
    product_variant_info = ProductVariantSerializer(source='product_variant', read_only=True)
    
    # Thông tin tính toán
    remaining_quantity = serializers.ReadOnlyField()
    is_fully_received = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseOrderDetail
        fields = [
            'id', 'purchase_order', 'product_variant', 'product_variant_info',
            'quantity', 'received_quantity', 'remaining_quantity', 'is_fully_received',
            'unit_price', 'discount_percent', 'discount_amount', 'tax_percent', 'tax_amount',
            'subtotal', 'total_amount', 'notes', 'expected_delivery_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'remaining_quantity', 'is_fully_received', 'discount_amount',
            'tax_amount', 'subtotal', 'total_amount', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra số lượng
        if 'quantity' in data and data['quantity'] <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        
        # Kiểm tra đơn giá
        if 'unit_price' in data and data['unit_price'] < 0:
            raise serializers.ValidationError("Đơn giá không được âm")
        
        # Kiểm tra phần trăm giảm giá
        if 'discount_percent' in data:
            if data['discount_percent'] < 0 or data['discount_percent'] > 100:
                raise serializers.ValidationError("Phần trăm giảm giá phải từ 0 đến 100")
        
        # Kiểm tra phần trăm thuế
        if 'tax_percent' in data:
            if data['tax_percent'] < 0 or data['tax_percent'] > 100:
                raise serializers.ValidationError("Phần trăm thuế phải từ 0 đến 100")
        
        return data


class PurchaseOrderDetailCreateSerializer(serializers.ModelSerializer):
    """
    Serializer cho tạo PurchaseOrderDetail (không bao gồm các trường tính toán)
    """
    class Meta:
        model = PurchaseOrderDetail
        fields = [
            'purchase_order', 'product_variant', 'quantity', 'unit_price', 'discount_percent',
            'tax_percent', 'notes', 'expected_delivery_date'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra số lượng
        if data['quantity'] <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        
        # Kiểm tra đơn giá
        if data['unit_price'] < 0:
            raise serializers.ValidationError("Đơn giá không được âm")
        
        # Kiểm tra phần trăm giảm giá
        if data.get('discount_percent', 0) < 0 or data.get('discount_percent', 0) > 100:
            raise serializers.ValidationError("Phần trăm giảm giá phải từ 0 đến 100")
        
        # Kiểm tra phần trăm thuế
        if data.get('tax_percent', 0) < 0 or data.get('tax_percent', 0) > 100:
            raise serializers.ValidationError("Phần trăm thuế phải từ 0 đến 100")
        
        return data 