from rest_framework import serializers
from apps.orders.models.coupon import Coupon
from apps.core.serializers import BaseSerializer

class CouponSerializer(BaseSerializer):
    is_valid = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value',
                 'minimum_order_amount', 'start_date', 'expires_at',
                 'usage_limit', 'is_active', 'is_valid', 'usage_count']
        read_only_fields = ('is_valid', 'usage_count')

    def get_is_valid(self, obj):
        return obj.is_valid()

    def get_usage_count(self, obj):
        return obj.get_usage_count()

    def validate(self, data):
        # Kiểm tra thời gian
        if data.get('start_date') and data.get('expires_at'):
            if data['start_date'] >= data['expires_at']:
                raise serializers.ValidationError({
                    'expires_at': 'Thời gian kết thúc phải sau thời gian bắt đầu'
                })
        
        # Kiểm tra giá trị discount
        if data.get('discount_type') == 'percentage' and data.get('discount_value'):
            if data['discount_value'] > 100:
                raise serializers.ValidationError({
                    'discount_value': 'Giảm giá theo phần trăm không được vượt quá 100%'
                })
        
        return data 