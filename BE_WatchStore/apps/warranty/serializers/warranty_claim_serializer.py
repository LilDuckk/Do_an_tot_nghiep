from rest_framework import serializers
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.serializers.warranty_serializer import WarrantySerializer
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from apps.users.serializers.user_serializer import UserSerializer

class WarrantyClaimSerializer(serializers.ModelSerializer):
    warranty = WarrantySerializer(read_only=True)
    technician = EmployeeSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = WarrantyClaim
        fields = ['id', 'warranty', 'claim_number', 'claim_date', 'description',
                 'resolution', 'status', 'completed_date', 'technician', 
                 'repair_cost', 'estimated_completion_date', 'customer_contact',
                 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 