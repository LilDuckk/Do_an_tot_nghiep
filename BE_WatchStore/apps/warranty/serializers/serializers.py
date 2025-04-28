from rest_framework import serializers
from ..models import Warranty, WarrantyClaim
from apps.orders.serializers import OrderDetailSerializer
from apps.users.serializers import UserSerializer
from apps.employees.serializers import EmployeeSerializer

class WarrantySerializer(serializers.ModelSerializer):
    order_detail = OrderDetailSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Warranty
        fields = '__all__'

class WarrantyClaimSerializer(serializers.ModelSerializer):
    warranty = WarrantySerializer(read_only=True)
    technician = EmployeeSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = WarrantyClaim
        fields = '__all__' 