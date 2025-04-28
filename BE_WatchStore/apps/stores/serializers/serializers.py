from rest_framework import serializers
from ..models import Store, Supplier, PurchaseOrder, PurchaseOrderDetail, StockTake, StockTakeDetail, StockTransfer, StockTransferDetail, Inventory, InventoryTransaction, ContactInfo
from apps.products.serializers import ProductVariantSerializer
from apps.users.serializers import EmployeeSerializer, UserSerializer

class ContactInfoSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ContactInfo
        fields = '__all__'

class StoreSerializer(serializers.ModelSerializer):
    manager = EmployeeSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    contact_info = ContactInfoSerializer(read_only=True)
    
    class Meta:
        model = Store
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = PurchaseOrderDetail
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    details = PurchaseOrderDetailSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'

class StockTakeDetailSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = StockTakeDetail
        fields = '__all__'

class StockTakeSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    details = StockTakeDetailSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
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
    details = StockTransferDetailSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = StockTransfer
        fields = '__all__'

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