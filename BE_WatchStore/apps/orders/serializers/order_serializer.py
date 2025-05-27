from rest_framework import serializers
from apps.orders.models.order import Orders
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.users.serializers.user_serializer import UserSerializer
from apps.stores.models.employee import Employee
from django.utils import timezone

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    customer_first_name = serializers.CharField(source='customer.first_name', read_only=True)
    
    class Meta:
        model = Orders
        fields = [
            'id', 'customer', 'customer_first_name', 'store', 'employee', 'order_date',
            'status', 'payment_method', 'payment_status',
            'shipping_address', 'shipping_method', 'tracking_number',
            'subtotal', 'tax', 'shipping_fee', 'discount', 'total_amount',
            'note', 'is_online_order', 'order_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'total_amount', 'employee', 'customer_first_name']

    def create(self, validated_data):
        # Lấy employee từ token
        request = self.context.get('request')
        if request and request.user:
            try:
                employee = Employee.objects.get(user=request.user)
                validated_data['employee'] = employee
            except Employee.DoesNotExist:
                pass

        # Set order_date nếu chưa có
        if not validated_data.get('order_date'):
            validated_data['order_date'] = timezone.now()

        # Set status mặc định nếu chưa có
        if not validated_data.get('status'):
            validated_data['status'] = 'pending'

        # Set payment_status mặc định nếu chưa có
        if not validated_data.get('payment_status'):
            validated_data['payment_status'] = 'pending'

        # Tạo order mới
        instance = super().create(validated_data)
        
        # Tính toán lại subtotal và total_amount sau khi tạo
        instance.subtotal = instance.calculate_subtotal()
        instance.total_amount = instance.calculate_total_amount()
        instance.save()
        
        return instance

    def update(self, instance, validated_data):
        # Cập nhật order
        instance = super().update(instance, validated_data)
        
        # Tính toán lại subtotal và total_amount sau khi cập nhật
        instance.subtotal = instance.calculate_subtotal()
        instance.total_amount = instance.calculate_total_amount()
        instance.save()
        
        return instance 