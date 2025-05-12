from rest_framework import viewsets
from apps.orders.models.customer import Customer
from apps.orders.serializers.customer_serializer import CustomerSerializer
from apps.core.utils import IsAdminUser

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['first_name', 'last_name', 'email', 'phone', 'birth_date', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 
