from rest_framework import serializers
from apps.orders.models.order import Orders
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.users.serializers.user_serializer import UserSerializer
from apps.stores.models.employee import Employee
from django.utils import timezone

class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=25, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=25, decimal_places=2, read_only=True)
    customer_first_name = serializers.CharField(source='customer.first_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    # Trường này sẽ được dùng để ghi (POST/PUT) ID của employee
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.filter(is_deleted=False),
        source='employee', # Ánh xạ tới trường employee trên model
        required=False,
        allow_null=True
    )

    # Trường này sẽ tùy chỉnh cách trường 'employee' được đọc (GET), hiển thị tên nhân viên
    employee = serializers.SerializerMethodField()

    class Meta:
        model = Orders
        fields = [
            'id', 'customer', 'customer_first_name', 'store', 'store_name', 
            'employee', 'employee_id', 'order_date',
            'status', 'payment_method', 'payment_status',
            'shipping_address', 'shipping_method', 'tracking_number',
            'subtotal', 'tax', 'shipping_fee', 'discount', 'total_amount',
            'note', 'is_online_order', 'order_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'total_amount', 'customer_first_name', 'store_name']

    def get_employee(self, obj):
        # Phương thức này sẽ được gọi khi trường 'employee' được serialize
        # Nó sẽ trả về username của employee nếu có
        if obj.employee and obj.employee.user:
            return obj.employee.user.username
        return None # Trả về None nếu không có employee

    def create(self, validated_data):
        # Đảm bảo order_date, status, payment_status có giá trị mặc định nếu không được cung cấp
        if not validated_data.get('order_date'):
            validated_data['order_date'] = timezone.now()
        if not validated_data.get('status'):
            validated_data['status'] = 'pending'
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