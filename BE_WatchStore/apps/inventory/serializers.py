from rest_framework import serializers
from .models import Inventory, InventoryTransaction, InventoryHistory

class InventoryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryHistory
        fields = '__all__' 