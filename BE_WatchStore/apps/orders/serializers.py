from rest_framework import serializers
from .models import Order, OrderDetail, OrderCoupon

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = '__all__'

class OrderCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderCoupon
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    order_coupons = OrderCouponSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__' 