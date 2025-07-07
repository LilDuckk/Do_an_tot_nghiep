from rest_framework import serializers
from apps.orders.models.customer import Customer
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.customer_serializer import CustomerSerializer
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.orders.models.coupon import Coupon
from django.utils import timezone
from decimal import Decimal

class CompleteOrderDetailSerializer(serializers.Serializer):
    product_variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_deleted=False),
        source='product_variant'
    )
    quantity = serializers.IntegerField(min_value=1)
    coupon_id = serializers.PrimaryKeyRelatedField(
        queryset=Coupon.objects.filter(is_active=True),
        source='coupon',
        required=False,
        allow_null=True
    )

class CompleteOrderSerializer(serializers.Serializer):
    # Customer information
    customer = CustomerSerializer()
    
    # Order information
    store_id = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.filter(is_deleted=False),
        source='store',
        required=False,
        allow_null=True
    )
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.filter(is_deleted=False),
        source='employee',
        required=False,
        allow_null=True
    )
    order_date = serializers.DateTimeField(required=False, default=timezone.now)
    status = serializers.CharField(max_length=50, required=False, default='pending')
    payment_method = serializers.CharField(max_length=50, required=False)
    payment_status = serializers.CharField(max_length=50, required=False, default='pending')
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    shipping_method = serializers.CharField(max_length=100, required=False)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    tax = serializers.DecimalField(max_digits=25, decimal_places=2, required=False, default=0)
    shipping_fee = serializers.DecimalField(max_digits=25, decimal_places=2, required=False, default=0)
    discount = serializers.DecimalField(max_digits=25, decimal_places=2, required=False, default=0)
    note = serializers.CharField(required=False, allow_blank=True)
    is_online_order = serializers.BooleanField(required=False, default=False)
    
    # Order details
    order_details = CompleteOrderDetailSerializer(many=True)
    
    def validate_order_details(self, value):
        if not value:
            raise serializers.ValidationError("Phải có ít nhất một sản phẩm trong đơn hàng")
        return value
    
    def validate(self, data):
        # Validate order details
        order_details = data.get('order_details', [])
        for detail in order_details:
            product_variant = detail.get('product_variant')
            quantity = detail.get('quantity', 0)
            
            # Kiểm tra tồn kho
            if hasattr(product_variant, 'inventory'):
                available_quantity = product_variant.inventory.quantity
                if quantity > available_quantity:
                    raise serializers.ValidationError({
                        'order_details': f'Sản phẩm {product_variant.product.name} chỉ còn {available_quantity} trong kho'
                    })
            
            # Validate coupon
            coupon = detail.get('coupon')
            if coupon:
                if not coupon.is_valid():
                    raise serializers.ValidationError({
                        'order_details': f'Coupon {coupon.code} không hợp lệ hoặc đã hết hạn'
                    })
                
                # Kiểm tra giá trị đơn hàng tối thiểu
                if coupon.minimum_order_amount:
                    unit_price = product_variant.product.base_price
                    total_amount = unit_price * quantity
                    if total_amount < coupon.minimum_order_amount:
                        raise serializers.ValidationError({
                            'order_details': f'Đơn hàng phải có giá trị tối thiểu {coupon.minimum_order_amount} để sử dụng coupon {coupon.code}'
                        })
        
        return data
    
    def create(self, validated_data):
        # Extract data
        customer_data = validated_data.pop('customer')
        order_details_data = validated_data.pop('order_details')
        
        # Logic xử lý khách hàng theo yêu cầu
        phone = customer_data.get('phone')
        email = customer_data.get('email')
        first_name = customer_data.get('first_name')
        
        # Tìm khách hàng có sẵn dựa trên SĐT
        existing_customer = None
        if phone:
            existing_customer = Customer.objects.filter(
                phone=phone, 
                is_deleted=False
            ).first()
        
        # Quyết định tạo mới hay sử dụng khách hàng có sẵn
        if existing_customer:
            # Kiểm tra xem có trùng cả email và tên không
            email_matches = email and existing_customer.email and email.lower() == existing_customer.email.lower()
            name_matches = first_name and existing_customer.first_name and first_name.lower() == existing_customer.first_name.lower()
            
            if email_matches and name_matches:
                # Trùng cả SĐT, email và tên -> Sử dụng khách hàng có sẵn
                customer = existing_customer
            else:
                # Trùng SĐT nhưng khác email/tên -> Tạo khách hàng mới
                customer = Customer.objects.create(**customer_data)
        else:
            # Không trùng SĐT -> Tạo khách hàng mới
            customer = Customer.objects.create(**customer_data)
        
        # Create order
        order = Orders.objects.create(
            customer=customer,
            **validated_data
        )
        
        # Create order details
        order_details = []
        for detail_data in order_details_data:
            product_variant = detail_data['product_variant']
            quantity = detail_data['quantity']
            coupon = detail_data.get('coupon')
            
            # Calculate unit price
            unit_price = product_variant.product.base_price
            if hasattr(product_variant, 'price_adjustment') and product_variant.price_adjustment:
                unit_price += product_variant.price_adjustment
            
            # Calculate discount
            discount_amount = Decimal('0')
            if coupon:
                if coupon.discount_type == 'percentage':
                    discount_amount = (unit_price * coupon.discount_value) / 100
                else:  # fixed amount
                    discount_amount = coupon.discount_value
                discount_amount = min(discount_amount, unit_price)
            
            # Calculate final price
            final_price = (unit_price - discount_amount) * quantity
            
            # Create order detail
            order_detail = OrderDetail.objects.create(
                order=order,
                product_variant=product_variant,
                quantity=quantity,
                unit_price=unit_price,
                discount=discount_amount,
                coupon=coupon,
                final_price=final_price
            )
            order_details.append(order_detail)
        
        # Update order totals
        order.update_totals()
        
        return {
            'customer': customer,
            'order': order,
            'order_details': order_details
        } 