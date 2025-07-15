from rest_framework import serializers
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.purchases.serializers.purchase_order_detail_serializer import PurchaseOrderDetailSerializer
from apps.stores.serializers.supplier_serializer import SupplierSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.stores.serializers.employee_serializer import EmployeeSerializer


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """
    Serializer cho PurchaseOrder
    """
    details = PurchaseOrderDetailSerializer(many=True, read_only=True)
    supplier_info = SupplierSerializer(source='supplier', read_only=True)
    store_info = StoreSerializer(source='store', read_only=True)
    employee_info = EmployeeSerializer(source='employee', read_only=True)
    
    # Thông tin tính toán
    remaining_amount = serializers.ReadOnlyField()
    is_fully_paid = serializers.ReadOnlyField()
    can_receive_goods = serializers.ReadOnlyField()
    
    # Thông tin người tạo/cập nhật
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'supplier', 'supplier_info', 'store', 'store_info',
            'employee', 'employee_info', 'order_date', 'expected_delivery_date',
            'actual_delivery_date', 'status', 'payment_terms', 'payment_status',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'paid_amount',
            'remaining_amount', 'is_fully_paid', 'can_receive_goods',
            'notes', 'shipping_address', 'shipping_method',
            'created_by', 'created_by_username', 'updated_by', 'updated_by_username',
            'created_at', 'updated_at', 'details'
        ]
        read_only_fields = [
            'id', 'po_number', 'total_amount', 'remaining_amount', 'is_fully_paid',
            'can_receive_goods', 'created_by', 'created_by_username', 'updated_by',
            'updated_by_username', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """
        Tạo đơn đặt hàng mới với mã tự động
        """
        # Tạo mã đơn đặt hàng tự động
        import datetime
        today = datetime.datetime.now()
        prefix = f"PO{today.strftime('%Y%m%d')}"
        
        # Tìm số thứ tự tiếp theo
        last_po = PurchaseOrder.objects.filter(
            po_number__startswith=prefix
        ).order_by('-po_number').first()
        
        if last_po:
            try:
                last_number = int(last_po.po_number[-4:])
                new_number = last_number + 1
            except ValueError:
                new_number = 1
        else:
            new_number = 1
        
        validated_data['po_number'] = f"{prefix}{new_number:04d}"
        
        return super().create(validated_data)
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra ngày giao hàng dự kiến
        if 'expected_delivery_date' in data and 'order_date' in data:
            if data['expected_delivery_date'] <= data['order_date']:
                raise serializers.ValidationError(
                    "Ngày giao hàng dự kiến phải sau ngày đặt hàng"
                )
        
        # Kiểm tra số tiền
        if 'subtotal' in data and data['subtotal'] < 0:
            raise serializers.ValidationError("Tổng tiền hàng không được âm")
        
        if 'tax_amount' in data and data['tax_amount'] < 0:
            raise serializers.ValidationError("Thuế không được âm")
        
        if 'discount_amount' in data and data['discount_amount'] < 0:
            raise serializers.ValidationError("Giảm giá không được âm")
        
        return data


class PurchaseOrderListSerializer(serializers.ModelSerializer):
    """
    Serializer cho danh sách PurchaseOrder (rút gọn)
    """
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'supplier_name', 'store_name', 'employee_name',
            'order_date', 'expected_delivery_date', 'status', 'payment_status',
            'total_amount', 'paid_amount', 'details_count', 'created_at'
        ]
    
    def get_details_count(self, obj):
        """Đếm số lượng chi tiết đơn hàng"""
        return obj.details.count() 