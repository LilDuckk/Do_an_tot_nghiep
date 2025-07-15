from rest_framework import serializers
from apps.warranty.models.warranty import Warranty
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer
from apps.orders.serializers.order_serializer import OrderDetailSerializer

class WarrantySerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    variant = serializers.SerializerMethodField()
    order_detail = serializers.SerializerMethodField()
    warranty_period = serializers.SerializerMethodField(help_text="Thời gian bảo hành hiệu lực (từ variant hoặc product)")
    remaining_days = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Warranty
        fields = ['id', 'warranty_number', 'product', 'variant', 'order_detail', 'warranty_start_date',
                 'warranty_end_date', 'serial_number', 'status', 'notes', 'warranty_period', 'remaining_days', 
                 'is_active', 'customer_name', 'customer_phone', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_product(self, obj):
        """Lấy thông tin product từ order detail"""
        if obj.order_detail and obj.order_detail.product_variant and obj.order_detail.product_variant.product:
            product = obj.order_detail.product_variant.product
            return {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'category': {
                    'id': product.category.id,
                    'name': product.category.name
                } if product.category else None,
                'brand': {
                    'id': product.brand.id,
                    'name': product.brand.name
                } if product.brand else None
            }
        return None

    def get_variant(self, obj):
        """Lấy thông tin variant từ order detail"""
        if obj.order_detail and obj.order_detail.product_variant:
            variant = obj.order_detail.product_variant
            return {
                'id': variant.id,
                'sku': variant.sku,
                'price_adjustment': str(variant.price_adjustment or '0.00'),
                'warranty_period': variant.get_warranty_period()
            }
        return None

    def get_order_detail(self, obj):
        """Lấy thông tin order detail"""
        if obj.order_detail:
            order = obj.order_detail.order
            
            # Tạo order_number từ ID và order_date
            order_number = f"ORD-{order.order_date.year if order.order_date else '2025'}-{order.id:03d}"
            
            # Xử lý customer info
            customer_info = None
            if order.customer:
                customer_name = f"{order.customer.first_name or ''} {order.customer.last_name or ''}".strip()
                if not customer_name:
                    customer_name = f"Khách hàng #{order.customer.id}"
                
                customer_info = {
                    'id': order.customer.id,
                    'first_name': order.customer.first_name or '',
                    'last_name': order.customer.last_name or '',
                    'phone': order.customer.phone,
                    'full_name': customer_name
                }
            
            return {
                'id': obj.order_detail.id,
                'order': {
                    'id': order.id,
                    'order_number': order_number,
                    'customer': customer_info
                },
                'quantity': obj.order_detail.quantity,
                'unit_price': str(obj.order_detail.unit_price),
                'final_price': str(obj.order_detail.final_price)
            }
        return None

    def get_warranty_period(self, obj):
        """Lấy thời gian bảo hành hiệu lực từ variant"""
        if obj.order_detail and obj.order_detail.product_variant:
            return obj.order_detail.product_variant.get_warranty_period()
        return None

    def get_remaining_days(self, obj):
        """Lấy số ngày còn lại của warranty"""
        return obj.get_remaining_days()

    def get_is_active(self, obj):
        """Kiểm tra warranty còn hiệu lực không"""
        return obj.is_active() 

    def get_customer_name(self, obj):
        """Lấy tên khách hàng từ order liên quan"""
        if obj.order_detail and obj.order_detail.order and obj.order_detail.order.customer:
            customer = obj.order_detail.order.customer
            customer_name = f"{customer.first_name or ''} {customer.last_name or ''}".strip()
            if not customer_name:
                return f"Khách hàng #{customer.id}"
            return customer_name
        return None 

    def get_customer_phone(self, obj):
        """Lấy số điện thoại khách hàng từ order liên quan"""
        if obj.order_detail and obj.order_detail.order and obj.order_detail.order.customer:
            return obj.order_detail.order.customer.phone
        return None 