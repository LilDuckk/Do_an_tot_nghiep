from rest_framework import serializers
from apps.stores.models.employee import Employee
from apps.stores.models.store import Store
from apps.users.serializers.user_serializer import UserSerializer

class BaseEmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'first_name', 'last_name', 'phone', 'address', 'employee_code', 'position']