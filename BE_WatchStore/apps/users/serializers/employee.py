from rest_framework import serializers
from ..models import Employee, UserAccount
from apps.stores.serializers.store import StoreSerializer
from .serializers import UserAccountSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserAccountSerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'first_name', 'last_name', 'phone',
            'address', 'employee_code', 'position', 'hire_date',
            'store'
        ] 