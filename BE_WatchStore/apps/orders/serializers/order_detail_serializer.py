from rest_framework import serializers
from apps.orders.models.order_detail import OrderDetail
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer
from apps.orders.serializers.coupon_serializer import CouponSerializer
from apps.orders.models.coupon import Coupon
from decimal import Decimal

class OrderDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer(source='product_variant.product', read_only=True)
    variant = ProductVariantSerializer(source='product_variant', read_only=True)
    coupon = CouponSerializer(read_only=True)
    coupon_id = serializers.PrimaryKeyRelatedField(
        queryset=Coupon.objects.filter(is_active=True),
        source='coupon',
        write_only=True,
        required=False,
        allow_null=True
    )
    unit_price = serializers.DecimalField(max_digits=25, decimal_places=2, read_only=True)
    discount = serializers.DecimalField(max_digits=25, decimal_places=2, read_only=True)
    final_price = serializers.DecimalField(max_digits=25, decimal_places=2, read_only=True)
    quantity = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    
    class Meta:
        model = OrderDetail
        fields = ['id', 'order', 'product_variant', 'product', 'variant', 'quantity',
                 'unit_price', 'discount', 'final_price', 'coupon', 'coupon_id',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'unit_price', 'discount', 'final_price')

    def validate(self, data):
        # Kiểm tra coupon có hợp lệ không
        coupon = data.get('coupon')
        if coupon:
            if not coupon.is_valid():
                raise serializers.ValidationError({
                    'coupon': 'Coupon không hợp lệ hoặc đã hết hạn'
                })
            
            # Kiểm tra giá trị đơn hàng tối thiểu nếu có
            if coupon.minimum_order_amount:
                product_variant = data.get('product_variant')
                if not product_variant:
                    raise serializers.ValidationError({
                        'product_variant': 'Vui lòng chọn sản phẩm'
                    })
                quantity = data.get('quantity', 0) or 0  # Mặc định là 0 nếu quantity là null
                total_amount = product_variant.product.base_price * quantity
                if total_amount < coupon.minimum_order_amount:
                    raise serializers.ValidationError({
                        'coupon': f'Đơn hàng phải có giá trị tối thiểu {coupon.minimum_order_amount}'
                    })
        
        return data

    def create(self, validated_data):
        # Lấy product_variant
        product_variant = validated_data.get('product_variant')
        if not product_variant:
            raise serializers.ValidationError({
                'product_variant': 'Vui lòng chọn sản phẩm'
            })

        # Tính toán unit_price từ base_price của sản phẩm
        validated_data['unit_price'] = product_variant.product.base_price

        # Tính toán discount từ coupon nếu có
        coupon = validated_data.get('coupon')
        if coupon:
            validated_data['discount'] = coupon.apply_discount(validated_data['unit_price'])
        else:
            validated_data['discount'] = Decimal('0')

        # Tính toán final_price
        quantity = validated_data.get('quantity', 0) or 0  # Mặc định là 0 nếu quantity là null
        unit_price = validated_data['unit_price']
        discount = validated_data['discount']
        validated_data['final_price'] = (unit_price - discount) * quantity

        # Tạo order detail
        instance = super().create(validated_data)
        return instance

    def update(self, instance, validated_data):
        # Cập nhật product_variant nếu có
        product_variant = validated_data.get('product_variant', instance.product_variant)
        
        # Cập nhật unit_price nếu product_variant thay đổi
        if product_variant != instance.product_variant:
            validated_data['unit_price'] = product_variant.product.base_price

        # Cập nhật discount từ coupon nếu có
        coupon = validated_data.get('coupon', instance.coupon)
        if coupon:
            validated_data['discount'] = coupon.apply_discount(validated_data.get('unit_price', instance.unit_price))
        else:
            validated_data['discount'] = Decimal('0')

        # Tính toán lại final_price
        quantity = validated_data.get('quantity', instance.quantity) or 0  # Mặc định là 0 nếu quantity là null
        unit_price = validated_data.get('unit_price', instance.unit_price)
        discount = validated_data.get('discount', instance.discount)
        validated_data['final_price'] = (unit_price - discount) * quantity

        # Cập nhật order detail
        instance = super().update(instance, validated_data)
        return instance 