from rest_framework import serializers

class BestSellingSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    brand_name = serializers.CharField(allow_null=True)
    category_name = serializers.CharField(allow_null=True)
    total_orders = serializers.IntegerField()
    total_quantity = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2) 