from rest_framework import serializers
from apps.reports.models.top_products import TopProduct

class TopProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopProduct
        fields = ['product_id', 'product_name', 'store_id', 'total_quantity', 'total_revenue', 'date'] 