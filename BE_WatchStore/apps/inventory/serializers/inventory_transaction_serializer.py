from rest_framework import serializers
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from decimal import Decimal

class InventoryTransactionSerializer(serializers.ModelSerializer):
    # Thông tin sản phẩm từ inventory
    product_variant_info = ProductVariantSerializer(source='inventory.product_variant', read_only=True)
    product_info = ProductSerializer(source='inventory.product_variant.product', read_only=True)
    
    # Thông tin cửa hàng từ inventory
    store_info = StoreSerializer(source='inventory.store', read_only=True)
    
    # Thông tin nhân viên từ reference (purchase_order hoặc goods_receipt)
    employee_info = serializers.SerializerMethodField()
    
    # Trường tính toán
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'inventory', 'product_variant_info', 'product_info', 'store_info',
            'transaction_type', 'quantity', 'unit_price', 'subtotal',
            'reference_id', 'reference_type', 'note', 'transaction_date', 
            'employee_info', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_subtotal(self, obj):
        """
        Tính tổng giá trị giao dịch = quantity * unit_price
        """
        if obj.quantity and obj.unit_price:
            return obj.quantity * obj.unit_price
        return Decimal('0.00')
    
    def get_employee_info(self, obj):
        """
        Lấy thông tin nhân viên từ reference (purchase_order hoặc goods_receipt)
        """
        try:
            if obj.reference_type == 'goods_receipt':
                from apps.purchases.models.goods_receipt import GoodsReceipt
                goods_receipt = GoodsReceipt.objects.get(id=obj.reference_id)
                if goods_receipt.employee:
                    return EmployeeSerializer(goods_receipt.employee).data
            elif obj.reference_type == 'purchase_order':
                from apps.purchases.models.purchase_order import PurchaseOrder
                purchase_order = PurchaseOrder.objects.get(id=obj.reference_id)
                if purchase_order.employee:
                    return EmployeeSerializer(purchase_order.employee).data
        except:
            pass
        return None


class InventoryTransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc tạo mới InventoryTransaction
    """
    # Thông tin cửa hàng từ inventory
    store_info = StoreSerializer(source='inventory.store', read_only=True)
    
    # Thông tin nhân viên từ reference
    employee_info = serializers.SerializerMethodField()
    
    # Trường tính toán
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'inventory', 'transaction_type', 'quantity', 'unit_price', 'subtotal', 'store_info',
            'reference_id', 'reference_type', 'note', 'employee_info'
        ]
    
    def get_subtotal(self, obj):
        """
        Tính tổng giá trị giao dịch = quantity * unit_price
        """
        if obj.quantity and obj.unit_price:
            return obj.quantity * obj.unit_price
        return Decimal('0.00')
    
    def get_employee_info(self, obj):
        """
        Lấy thông tin nhân viên từ reference (purchase_order hoặc goods_receipt)
        """
        try:
            if obj.reference_type == 'goods_receipt':
                from apps.purchases.models.goods_receipt import GoodsReceipt
                goods_receipt = GoodsReceipt.objects.get(id=obj.reference_id)
                if goods_receipt.employee:
                    return EmployeeSerializer(goods_receipt.employee).data
            elif obj.reference_type == 'purchase_order':
                from apps.purchases.models.purchase_order import PurchaseOrder
                purchase_order = PurchaseOrder.objects.get(id=obj.reference_id)
                if purchase_order.employee:
                    return EmployeeSerializer(purchase_order.employee).data
        except:
            pass
        return None
    
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