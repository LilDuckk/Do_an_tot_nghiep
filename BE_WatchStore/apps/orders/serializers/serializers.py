from rest_framework import serializers
from ..models import Order, OrderDetail, OrderCoupon
from apps.products.serializers import ProductVariantSerializer
from apps.customers.serializers import CustomerSerializer
from apps.stores.serializers import StoreSerializer
from apps.employees.serializers import EmployeeSerializer
from apps.coupons.serializers import CouponSerializer
from apps.users.serializers import UserSerializer

class OrderDetailSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = OrderDetail
        fields = '__all__'

class OrderCouponSerializer(serializers.ModelSerializer):
    coupon = CouponSerializer(read_only=True)
    
    class Meta:
        model = OrderCoupon
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    employee = EmployeeSerializer(read_only=True)
    details = OrderDetailSerializer(many=True, read_only=True)
    coupons = OrderCouponSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__' 