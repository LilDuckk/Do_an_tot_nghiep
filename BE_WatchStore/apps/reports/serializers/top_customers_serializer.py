from rest_framework import serializers

class TopCustomersSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField(allow_null=True)
    phone = serializers.CharField(allow_null=True)
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=25, decimal_places=2)
    last_order_date = serializers.DateTimeField(allow_null=True) 