from rest_framework import serializers
from .models import (
    ProductCategory, Brand, Product, ProductImage,
    Customer, Order, OrderDetail, Store, Employee,
    Inventory, StockIn, StockOut, Revenue, Attribute,
    CategoryAttribute, AttributeValue, ProductVariant,
    ProductVariantAttribute, Shipment, ProductSpecification,
    ProductReview, ProductWishlist, Coupon, Return, WarrantyCard,
    PriceHistory, Notification, LoginHistory
)
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

# Trang khách hàng
class ProductCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'description', 'parent_id', 'image_url', 
                 'is_active', 'display_order', 'children']
        read_only_fields = ['created_at', 'updated_at']

    def get_children(self, obj):
        if obj.children.exists():
            return ProductCategorySerializer(obj.children.all(), many=True).data
        return []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.parent:
            data['parent'] = {
                'id': instance.parent.id,
                'name': instance.parent.name,
                'description': instance.parent.description
            }
        return data

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description', 'logo_url', 'is_active', 'display_order']
        read_only_fields = ['created_at', 'updated_at']

class ProductImageSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image_url', 'is_main', 'display_order']
        read_only_fields = ['created_at']

    def validate_image_url(self, value):
        if not value:
            raise serializers.ValidationError("URL hình ảnh là bắt buộc")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['product'] = {
            'id': instance.product.id,
            'name': instance.product.name
        }
        return data

class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    brand_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'brand', 
                 'base_price', 'is_active', 'images', 'category_id', 'brand_id']
        read_only_fields = ['created_at', 'updated_at']

    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá sản phẩm phải lớn hơn 0")
        return value

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 
                 'address', 'customer_type', 'birth_date', 'gender']
        read_only_fields = ['created_at', 'updated_at', 'total_purchases', 
                           'total_spent', 'last_purchase_date']
        extra_kwargs = {
            'email': {'required': False, 'allow_null': True, 'allow_blank': False},
            'phone': {'required': True, 'allow_blank': True},
            'address': {'required': False, 'allow_null': True, 'allow_blank': False},
            'birth_date': {'required': False, 'allow_null': True},
            'gender': {'required': False, 'allow_blank': True},
            'customer_type': {'required': False, 'allow_blank': True}
        }

    def validate_email(self, value):
        if value and Customer.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã tồn tại")
        return value

class EmployeeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Employee
        fields = ['id', 'user', 'first_name', 'last_name', 'email', 'phone',
                 'role', 'hire_date', 'employee_code', 'position', 'department',
                 'salary', 'is_active']
        read_only_fields = ['created_at', 'updated_at']

    def validate_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Lương phải lớn hơn 0")
        return value

class StoreSerializer(serializers.ModelSerializer):
    manager = EmployeeSerializer(read_only=True)
    manager_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Store
        fields = ['id', 'name', 'address', 'phone', 'store_code', 'store_type',
                 'manager', 'is_active', 'opening_date', 'closing_date', 'manager_id']
        read_only_fields = ['created_at', 'updated_at']

    def validate_store_code(self, value):
        if Store.objects.filter(store_code=value).exists():
            raise serializers.ValidationError("Mã cửa hàng đã tồn tại")
        return value

class OrderDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    order = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrderDetail
        fields = ['id', 'order', 'product', 'quantity', 'unit_price', 'product_id']
        read_only_fields = ['unit_price']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        return value

    def validate(self, data):
        if not data.get('product_id'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('quantity'):
            raise serializers.ValidationError("Số lượng là bắt buộc")
        return data

class OrderSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    details = OrderDetailSerializer(many=True, read_only=True, source='orderdetail_set')
    order_details = serializers.JSONField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'store', 'store_id', 'customer', 'customer_id', 'order_date', 'status', 'payment_method', 
                 'shipping_address', 'shipping_fee', 'discount_amount', 'total_amount', 'final_amount', 'details', 'order_details']
        read_only_fields = ['total_amount', 'final_amount']

    def validate(self, data):
        if self.context['request'].method == 'POST':
            if not data.get('order_details'):
                raise serializers.ValidationError("Đơn hàng phải có ít nhất một sản phẩm")
            if not data.get('customer_id'):
                raise serializers.ValidationError("Khách hàng là bắt buộc")
            if not data.get('store_id'):
                raise serializers.ValidationError("Cửa hàng là bắt buộc")
            if not data.get('shipping_address'):
                raise serializers.ValidationError("Địa chỉ giao hàng là bắt buộc")
            if not data.get('payment_method'):
                raise serializers.ValidationError("Phương thức thanh toán là bắt buộc")
        return data

    def create(self, validated_data):
        order_details_data = validated_data.pop('order_details')
        total_amount = 0
        
        # Tính tổng tiền từ chi tiết đơn hàng
        for detail in order_details_data:
            product = Product.objects.get(id=detail['product_id'])
            detail['unit_price'] = product.base_price
            total_amount += detail['quantity'] * detail['unit_price']
        
        # Tạo đơn hàng với tổng tiền đã tính
        validated_data['total_amount'] = total_amount
        validated_data['final_amount'] = total_amount + validated_data.get('shipping_fee', 0) - validated_data.get('discount_amount', 0)
        order = Order.objects.create(**validated_data)
        
        # Tạo chi tiết đơn hàng
        for detail in order_details_data:
            OrderDetail.objects.create(
                order=order,
                product_id=detail['product_id'],
                quantity=detail['quantity'],
                unit_price=detail['unit_price']
            )
        
        return order

class InventorySerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'store', 'product', 'quantity_in_stock', 'minimum_stock',
                 'maximum_stock', 'last_restocked_date', 'store_id', 'product_id']
        read_only_fields = ['last_restocked_date']

    def validate(self, data):
        if data.get('minimum_stock', 0) < 0:
            raise serializers.ValidationError("Số lượng tối thiểu không được âm")
        if data.get('maximum_stock', 0) < data.get('minimum_stock', 0):
            raise serializers.ValidationError("Số lượng tối đa phải lớn hơn số lượng tối thiểu")
        if data.get('quantity_in_stock', 0) < 0:
            raise serializers.ValidationError("Số lượng trong kho không được âm")
        return data

class StockInSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = StockIn
        fields = ['id', 'store', 'product', 'quantity', 'cost_price',
                 'stock_in_date', 'supplier_name', 'store_id', 'product_id']
        read_only_fields = []

    def validate_cost_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá nhập phải lớn hơn 0")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        return value

    def validate(self, data):
        if not data.get('stock_in_date'):
            raise serializers.ValidationError("Ngày nhập kho là bắt buộc")
        if not data.get('store_id'):
            raise serializers.ValidationError("Cửa hàng là bắt buộc")
        if not data.get('product_id'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('supplier_name'):
            raise serializers.ValidationError("Tên nhà cung cấp là bắt buộc")
        return data

class StockOutSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    employee = EmployeeSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)
    employee_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = StockOut
        fields = ['id', 'store', 'product', 'quantity', 'sale_price',
                 'stock_out_date', 'employee', 'store_id', 'product_id', 'employee_id']
        read_only_fields = []

    def validate_sale_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá bán phải lớn hơn 0")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số lượng phải lớn hơn 0")
        return value
        
    def validate(self, data):
        if not data.get('stock_out_date'):
            raise serializers.ValidationError("Ngày xuất kho là bắt buộc")
        if not data.get('store_id'):
            raise serializers.ValidationError("Cửa hàng là bắt buộc")
        if not data.get('product_id'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('employee_id'):
            raise serializers.ValidationError("Nhân viên là bắt buộc")
        return data

class RevenueSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Revenue
        fields = ['id', 'store', 'revenue_amount', 'revenue_date', 'store_id']
        read_only_fields = []

    def validate_revenue_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Doanh thu phải lớn hơn 0")
        return value

    def validate(self, data):
        if not data.get('revenue_date'):
            raise serializers.ValidationError("Ngày doanh thu là bắt buộc")
        if not data.get('store_id'):
            raise serializers.ValidationError("Cửa hàng là bắt buộc")
        if not data.get('revenue_amount'):
            raise serializers.ValidationError("Số tiền doanh thu là bắt buộc")
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = ['id', 'name', 'description']

class CategoryAttributeSerializer(serializers.ModelSerializer):
    attribute = AttributeSerializer(read_only=True)
    attribute_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CategoryAttribute
        fields = ['id', 'category', 'attribute', 'attribute_id', 'is_required', 'affects_price', 'display_order']

class AttributeValueSerializer(serializers.ModelSerializer):
    attribute = AttributeSerializer(read_only=True)
    attribute_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute', 'attribute_id', 'value']

class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    variant_attributes = AttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'product_id', 'sku_code', 'price_adjustment', 'stock',
                 'is_active', 'barcode', 'weight', 'dimensions', 'variant_attributes']
        read_only_fields = ['created_at', 'updated_at']

class ProductVariantAttributeSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(write_only=True)
    attribute_value = AttributeValueSerializer(read_only=True)
    attribute_value_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProductVariantAttribute
        fields = ['id', 'variant', 'variant_id', 'attribute_value', 'attribute_value_id']

class ShipmentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Shipment
        fields = ['id', 'order', 'order_id', 'shipping_method', 'tracking_number',
                 'status', 'estimated_delivery_date', 'actual_delivery_date']
        read_only_fields = ['created_at', 'updated_at']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = ProductSpecification
        fields = ['id', 'product', 'name', 'value']
        read_only_fields = ['created_at']

    def validate(self, data):
        if not data.get('name'):
            raise serializers.ValidationError("Tên thông số kỹ thuật là bắt buộc")
        if not data.get('value'):
            raise serializers.ValidationError("Giá trị thông số kỹ thuật là bắt buộc")
        return data

class ProductReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'product_id', 'customer', 'customer_id',
                 'rating', 'comment', 'review_date', 'is_approved']
        read_only_fields = ['review_date']

class ProductWishlistSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = ProductWishlist
        fields = ['id', 'customer', 'product', 'added_date']
        read_only_fields = ['added_date']

    def validate(self, data):
        if not data.get('customer'):
            raise serializers.ValidationError("Khách hàng là bắt buộc")
        if not data.get('product'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        return data

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'start_date',
                 'end_date', 'is_active', 'usage_limit', 'used_count']
        read_only_fields = ['created_at', 'updated_at']

class ReturnSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Return
        fields = ['id', 'order', 'product', 'quantity', 'reason', 'status']
        read_only_fields = ['created_at']

    def validate(self, data):
        if not data.get('order'):
            raise serializers.ValidationError("Đơn hàng là bắt buộc")
        if not data.get('product'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('reason'):
            raise serializers.ValidationError("Lý do trả hàng là bắt buộc")
        return data

class WarrantyCardSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())

    class Meta:
        model = WarrantyCard
        fields = ['id', 'order', 'product', 'customer', 'issue_date', 'expiry_date', 'status']
        read_only_fields = ['created_at']

    def validate(self, data):
        if not data.get('order'):
            raise serializers.ValidationError("Đơn hàng là bắt buộc")
        if not data.get('product'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('customer'):
            raise serializers.ValidationError("Khách hàng là bắt buộc")
        if not data.get('issue_date'):
            raise serializers.ValidationError("Ngày phát hành là bắt buộc")
        if not data.get('expiry_date'):
            raise serializers.ValidationError("Ngày hết hạn là bắt buộc")
        return data

class PriceHistorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    changed_by = UserSerializer(read_only=True)
    changed_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PriceHistory
        fields = ['id', 'product', 'product_id', 'old_price', 'new_price',
                 'changed_by', 'changed_by_id', 'changed_at', 'reason']
        read_only_fields = ['changed_at']

    def validate_old_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá cũ phải lớn hơn 0")
        return value

    def validate_new_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá mới phải lớn hơn 0")
        return value

    def validate(self, data):
        if not data.get('product_id'):
            raise serializers.ValidationError("Sản phẩm là bắt buộc")
        if not data.get('changed_by_id'):
            raise serializers.ValidationError("Người thay đổi là bắt buộc")
        if not data.get('reason'):
            raise serializers.ValidationError("Lý do thay đổi là bắt buộc")
        return data

class NotificationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    created_by_id = serializers.IntegerField(write_only=True)
    updated_by = UserSerializer(read_only=True)
    updated_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'content', 'type', 'is_read', 'expiry_date',
                 'is_active', 'created_by', 'created_by_id', 'updated_by',
                 'updated_by_id', 'created_at']
        read_only_fields = ['created_at']

class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LoginHistory
        fields = ['id', 'user', 'user_id', 'login_time', 'ip_address',
                 'device_info', 'status']
        read_only_fields = ['login_time']

    def validate_ip_address(self, value):
        if not value:
            raise serializers.ValidationError("Địa chỉ IP là bắt buộc")
        return value

    def validate_device_info(self, value):
        if not value:
            raise serializers.ValidationError("Thông tin thiết bị là bắt buộc")
        return value

    def validate(self, data):
        if not data.get('user_id'):
            raise serializers.ValidationError("Người dùng là bắt buộc")
        if not data.get('status'):
            raise serializers.ValidationError("Trạng thái là bắt buộc")
        return data 