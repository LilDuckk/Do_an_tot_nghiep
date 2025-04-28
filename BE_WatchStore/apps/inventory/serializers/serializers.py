from rest_framework import serializers
from ..models import Inventory, InventoryTransaction, StockTake, StockTakeDetail, StockTransfer, StockTransferDetail, InventoryHistory
from apps.products.serializers import ProductVariantSerializer
from apps.stores.serializers import StoreSerializer
from apps.users.serializers import UserSerializer

class InventoryTransactionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = InventoryTransaction
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    transactions = InventoryTransactionSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'

class StockTakeDetailSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = StockTakeDetail
        fields = '__all__'

class StockTakeSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    details = StockTakeDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = StockTake
        fields = '__all__'

class StockTransferDetailSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = StockTransferDetail
        fields = '__all__'

class StockTransferSerializer(serializers.ModelSerializer):
    source_store = StoreSerializer(read_only=True)
    destination_store = StoreSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    details = StockTransferDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = StockTransfer
        fields = '__all__'

class InventoryHistorySerializer(serializers.ModelSerializer):
    inventory = InventorySerializer(read_only=True)
    employee = UserSerializer(read_only=True)
    
    class Meta:
        model = InventoryHistory
        fields = '__all__' 