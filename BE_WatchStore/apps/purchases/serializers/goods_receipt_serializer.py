from rest_framework import serializers
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.purchases.serializers.goods_receipt_detail_serializer import GoodsReceiptDetailSerializer
from apps.stores.serializers.supplier_serializer import SupplierSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.stores.serializers.employee_serializer import EmployeeSerializer


class GoodsReceiptSerializer(serializers.ModelSerializer):
    """
    Serializer cho GoodsReceipt
    """
    details = GoodsReceiptDetailSerializer(many=True, read_only=True)
    supplier_info = SupplierSerializer(source='supplier', read_only=True)
    store_info = StoreSerializer(source='store', read_only=True)
    employee_info = EmployeeSerializer(source='employee', read_only=True)
    purchase_order_info = serializers.SerializerMethodField()
    
    # Thông tin tính toán
    can_update_inventory = serializers.ReadOnlyField()
    is_from_purchase_order = serializers.ReadOnlyField()
    
    # Thông tin người tạo/cập nhật
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = GoodsReceipt
        fields = [
            'id', 'receipt_number', 'purchase_order', 'purchase_order_info', 'supplier', 'supplier_info',
            'store', 'store_info', 'employee', 'employee_info', 'receipt_date', 'expected_receipt_date',
            'delivery_note', 'vehicle_number', 'driver_name', 'status',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'can_update_inventory', 'is_from_purchase_order',
            'notes', 'quality_check_notes', 'is_quality_checked',
            'created_by', 'created_by_username', 'updated_by', 'updated_by_username',
            'created_at', 'updated_at', 'details'
        ]
        read_only_fields = [
            'id', 'receipt_number', 'total_amount',
            'can_update_inventory', 'is_from_purchase_order', 'created_by', 'created_by_username',
            'updated_by', 'updated_by_username', 'created_at', 'updated_at'
        ]
    
    def get_purchase_order_info(self, obj):
        """Lấy thông tin đơn đặt hàng nếu có"""
        if obj.purchase_order:
            return {
                'id': obj.purchase_order.id,
                'po_number': obj.purchase_order.po_number,
                'status': obj.purchase_order.status
            }
        return None
    
    def create(self, validated_data):
        """
        Tạo phiếu nhập kho mới với mã tự động
        """
        # Tạo mã phiếu nhập tự động
        import datetime
        today = datetime.datetime.now()
        prefix = f"GR{today.strftime('%Y%m%d')}"
        
        # Tìm số thứ tự tiếp theo (bao gồm cả xóa mềm)
        last_gr = GoodsReceipt.objects.filter(
            receipt_number__startswith=prefix
        ).order_by('-receipt_number').first()
        
        if last_gr:
            try:
                last_number = int(last_gr.receipt_number[-4:])
                new_number = last_number + 1
            except ValueError:
                new_number = 1
        else:
            new_number = 1
        
        # Kiểm tra xem mã mới có bị trùng không (bao gồm cả xóa mềm)
        new_receipt_number = f"{prefix}{new_number:04d}"
        while GoodsReceipt.objects.filter(receipt_number=new_receipt_number).exists():
            new_number += 1
            new_receipt_number = f"{prefix}{new_number:04d}"
        
        validated_data['receipt_number'] = new_receipt_number
        
        return super().create(validated_data)
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra ngày nhập kho
        if 'receipt_date' in data and 'expected_receipt_date' in data:
            if data['expected_receipt_date'] and data['receipt_date'] < data['expected_receipt_date']:
                raise serializers.ValidationError(
                    "Ngày nhập kho không được trước ngày nhập kho dự kiến"
                )
        
        # Kiểm tra số tiền
        if 'subtotal' in data and data['subtotal'] < 0:
            raise serializers.ValidationError("Tổng tiền hàng không được âm")
        
        if 'tax_amount' in data and data['tax_amount'] < 0:
            raise serializers.ValidationError("Thuế không được âm")
        
        if 'discount_amount' in data and data['discount_amount'] < 0:
            raise serializers.ValidationError("Giảm giá không được âm")
        
        # Kiểm tra đơn đặt hàng nếu có
        if 'purchase_order' in data and data['purchase_order']:
            po = data['purchase_order']
            
            # Kiểm tra trạng thái đơn đặt hàng
            if not po.can_receive_goods:
                if po.status in ['draft', 'pending', 'cancelled']:
                    raise serializers.ValidationError(
                        f"Đơn đặt hàng (PO: {po.po_number}) chưa được duyệt hoặc đã bị hủy (trạng thái: {po.status}), không thể nhận hàng. Vui lòng xác nhận đơn đặt hàng trước khi nhập kho."
                    )
                else:
                    raise serializers.ValidationError(
                        f"Đơn đặt hàng (PO: {po.po_number}) ở trạng thái không hợp lệ để nhận hàng: {po.status}."
                    )
            
            # Kiểm tra xem đơn đặt hàng đã có phiếu nhập kho chưa (bao gồm cả xóa mềm)
            existing_receipt = GoodsReceipt.objects.filter(
                purchase_order=po
            ).first()
            
            if existing_receipt:
                if existing_receipt.is_deleted:
                    # Nếu phiếu nhập kho đã bị xóa mềm, cho phép tạo mới
                    pass
                else:
                    # Nếu phiếu nhập kho chưa bị xóa, báo lỗi
                    raise serializers.ValidationError(
                        f"Đơn đặt hàng (PO: {po.po_number}) đã có phiếu nhập kho (GR: {existing_receipt.receipt_number}). "
                        f"Mỗi đơn đặt hàng chỉ có thể tạo 1 phiếu nhập kho. Nếu muốn tạo mới, vui lòng xóa phiếu nhập kho cũ trước."
                    )
        
        return data


class GoodsReceiptListSerializer(serializers.ModelSerializer):
    """
    Serializer cho danh sách GoodsReceipt (rút gọn)
    """
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    purchase_order_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GoodsReceipt
        fields = [
            'id', 'receipt_number', 'supplier_name', 'store_name', 'employee_name',
            'purchase_order_number', 'receipt_date', 'status',
            'total_amount', 'details_count', 'is_quality_checked', 'created_at'
        ]
    
    def get_details_count(self, obj):
        """Đếm số lượng chi tiết phiếu nhập"""
        return obj.details.count() 