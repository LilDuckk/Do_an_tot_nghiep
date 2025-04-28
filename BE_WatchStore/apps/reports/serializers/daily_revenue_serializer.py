from rest_framework import serializers
from apps.reports.models.daily_revenue import DailyRevenue

class DailyRevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyRevenue
        fields = ['date', 'store_id', 'total_revenue', 'total_orders', 'average_order_value'] 