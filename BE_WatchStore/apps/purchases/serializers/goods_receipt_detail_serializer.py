from rest_framework import serializers
from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
from apps.products.serializers.product_serializer import ProductVariantSerializer


class GoodsReceiptDetailSerializer(serializers.ModelSerializer):
    """
    Serializer cho GoodsReceiptDetail
    """
    product_variant_info = ProductVariantSerializer(source='product_variant', read_only=True)
    
    # Thông tin tính toán
    missing_quantity = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    is_quality_checked = serializers.ReadOnlyField()
    can_update_inventory = serializers.ReadOnlyField()
    
    class Meta:
        model = GoodsReceiptDetail
        fields = [
            'id', 'goods_receipt', 'purchase_order_detail', 'product_variant', 'product_variant_info',
            'ordered_quantity', 'received_quantity', 'accepted_quantity', 'rejected_quantity', 'missing_quantity',
            'unit_price', 'discount_percent', 'discount_amount', 'tax_percent', 'tax_amount',
            'subtotal', 'total_amount', 'quality_status', 'quality_notes', 'expiry_date',
            'batch_number', 'notes', 'is_quality_checked', 'can_update_inventory',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'rejected_quantity', 'missing_quantity', 'total_amount', 'is_quality_checked', 'can_update_inventory',
            'discount_amount', 'tax_amount', 'subtotal', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra số lượng
        if 'received_quantity' in data and data['received_quantity'] <= 0:
            raise serializers.ValidationError("Số lượng nhập phải lớn hơn 0")
        
        # Kiểm tra số lượng chấp nhận và từ chối
        if 'accepted_quantity' in data and 'rejected_quantity' in data and 'received_quantity' in data:
            total_processed = data['accepted_quantity'] + data['rejected_quantity']
            if total_processed > data['received_quantity']:
                raise serializers.ValidationError(
                    "Tổng số lượng chấp nhận và từ chối không được vượt quá số lượng nhập"
                )
        
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


class GoodsReceiptDetailCreateSerializer(serializers.ModelSerializer):
    """
    Serializer cho tạo GoodsReceiptDetail (không bao gồm các trường tính toán)
    """
    class Meta:
        model = GoodsReceiptDetail
        fields = [
            'goods_receipt', 'product_variant', 'purchase_order_detail', 'ordered_quantity', 'received_quantity',
            'accepted_quantity', 'unit_price', 'discount_percent',
            'tax_percent', 'quality_status', 'quality_notes', 'expiry_date', 'batch_number', 'notes'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        # Kiểm tra goods_receipt
        if 'goods_receipt' not in data:
            raise serializers.ValidationError("goods_receipt is required")
        
        # Kiểm tra product_variant
        if 'product_variant' not in data:
            raise serializers.ValidationError("product_variant is required")
        
        # Kiểm tra xem sản phẩm đã tồn tại trong phiếu nhập kho chưa
        goods_receipt = data['goods_receipt']
        product_variant = data['product_variant']
        
        # Lấy instance hiện tại (nếu đang update)
        current_instance = self.instance
        
        # Kiểm tra xem sản phẩm đã tồn tại trong phiếu nhập kho chưa
        existing_detail = GoodsReceiptDetail.objects.filter(
            goods_receipt=goods_receipt,
            product_variant=product_variant,
            is_deleted=False
        ).first()
        
        if existing_detail:
            # Nếu đang update và existing_detail chính là instance hiện tại, cho phép
            if current_instance and existing_detail.id == current_instance.id:
                pass
            else:
                # Nếu sản phẩm đã tồn tại và không phải instance hiện tại, báo lỗi
                raise serializers.ValidationError(
                    f"Sản phẩm '{product_variant.product.name if product_variant.product else product_variant.sku}' đã tồn tại trong phiếu nhập kho này. "
                    f"Mỗi sản phẩm chỉ có thể có một chi tiết trong một phiếu nhập kho."
                )
        
        # Kiểm tra số lượng - cho phép 0 khi tạo từ đơn đặt hàng
        if data.get('received_quantity', 0) < 0:
            raise serializers.ValidationError("Số lượng nhập không được âm")
        
        # Kiểm tra số lượng chấp nhận không được vượt quá số lượng nhập
        if data.get('accepted_quantity', 0) > data.get('received_quantity', 0):
            raise serializers.ValidationError(
                "Số lượng chấp nhận không được vượt quá số lượng nhập"
            )
        
        # Kiểm tra đơn giá - cho phép 0 khi tạo từ đơn đặt hàng
        if data.get('unit_price', 0) < 0:
            raise serializers.ValidationError("Đơn giá không được âm")
        
        # Kiểm tra phần trăm giảm giá
        if data.get('discount_percent', 0) < 0 or data.get('discount_percent', 0) > 100:
            raise serializers.ValidationError("Phần trăm giảm giá phải từ 0 đến 100")
        
        # Kiểm tra phần trăm thuế
        if data.get('tax_percent', 0) < 0 or data.get('tax_percent', 0) > 100:
            raise serializers.ValidationError("Phần trăm thuế phải từ 0 đến 100")
        
        return data


class GoodsReceiptDetailUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer cho cập nhật GoodsReceiptDetail (chỉ cho phép cập nhật một số trường)
    """
    class Meta:
        model = GoodsReceiptDetail
        fields = [
            'accepted_quantity', 'quality_status', 'quality_notes'
        ]
    
    def validate(self, data):
        """
        Validate dữ liệu
        """
        instance = self.instance
        
        # Kiểm tra số lượng chấp nhận không được vượt quá số lượng nhập
        new_accepted_quantity = data.get('accepted_quantity', instance.accepted_quantity)
        if new_accepted_quantity > instance.received_quantity:
            raise serializers.ValidationError(
                "Số lượng chấp nhận không được vượt quá số lượng nhập"
            )
        
        return data 