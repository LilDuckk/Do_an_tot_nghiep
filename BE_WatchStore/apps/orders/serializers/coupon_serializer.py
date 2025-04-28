from rest_framework import serializers
from apps.orders.models.coupon import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_purchase',
                 'start_date', 'end_date', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 