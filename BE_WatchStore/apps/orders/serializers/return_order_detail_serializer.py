from rest_framework import serializers
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer
from apps.orders.models.order_detail import OrderDetail
from django.db import models


class ReturnOrderDetailSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    variant = serializers.SerializerMethodField()
    order_detail_info = serializers.SerializerMethodField()
    original_quantity = serializers.SerializerMethodField()
    returned_quantity = serializers.SerializerMethodField()
    available_for_return = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = ReturnOrderDetail
        fields = [
            'id', 'return_order', 'order_detail', 'product', 'variant', 
            'order_detail_info', 'quantity', 'original_quantity', 'returned_quantity',
            'available_for_return', 'unit_price', 'total_price', 'reason', 'condition',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def get_product(self, obj):
        """Lấy thông tin product từ order detail hoặc product_variant"""
        if obj.order_detail and obj.order_detail.product_variant:
            product = obj.order_detail.product_variant.product
            return {
                'id': product.id,
                'name': product.name,
                'description': product.description
            }
        elif obj.product_variant:
            product = obj.product_variant.product
            return {
                'id': product.id,
                'name': product.name,
                'description': product.description
            }
        return None

    def get_variant(self, obj):
        """Lấy thông tin variant từ order detail hoặc product_variant"""
        variant = obj.order_detail.product_variant if obj.order_detail else obj.product_variant
        if variant:
            return {
                'id': variant.id,
                'sku': variant.sku,
                'price_adjustment': str(variant.price_adjustment or '0.00')
            }
        return None

    def get_order_detail_info(self, obj):
        """Lấy thông tin chi tiết của order detail gốc"""
        if obj.order_detail:
            return {
                'id': obj.order_detail.id,
                'quantity': obj.order_detail.quantity,
                'unit_price': str(obj.order_detail.unit_price),
                'final_price': str(obj.order_detail.final_price),
                'discount': str(obj.order_detail.discount or '0.00')
            }
        return None

    def get_original_quantity(self, obj):
        """Lấy số lượng gốc từ order detail"""
        return obj.order_detail.quantity if obj.order_detail else 0

    def get_returned_quantity(self, obj):
        """Lấy số lượng đã trả (từ return order detail hiện tại)"""
        return obj.quantity

    def get_available_for_return(self, obj):
        """Lấy số lượng còn có thể trả"""
        if obj.order_detail:
            # Tính tổng số lượng đã trả cho order detail này
            total_returned = ReturnOrderDetail.objects.filter(
                order_detail=obj.order_detail,
                is_deleted=False
            ).exclude(id=obj.id).aggregate(
                total=models.Sum('quantity')
            )['total'] or 0
            
            return max(0, obj.order_detail.quantity - total_returned - obj.quantity)
        return 0

    def get_unit_price(self, obj):
        """Lấy đơn giá từ order detail"""
        if obj.order_detail:
            return str(obj.order_detail.unit_price)
        return '0.00'

    def get_total_price(self, obj):
        """Tính tổng giá trị trả hàng"""
        if obj.order_detail:
            unit_price = obj.order_detail.unit_price
            return str(unit_price * obj.quantity)
        return '0.00' 