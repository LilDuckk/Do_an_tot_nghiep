from rest_framework import serializers
from apps.inventory.models.stock_transfer import StockTransfer, StockTransferDetail
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.products.serializers.product_serializer import ProductVariantSerializer
from apps.users.serializers.user_serializer import UserSerializer

class StockTransferDetailSerializer(serializers.ModelSerializer):
    product_variant_info = ProductVariantSerializer(source='product_variant', read_only=True)
    stock_transfer_info = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = StockTransferDetail
        fields = [
            'id', 'stock_transfer', 'stock_transfer_info', 'product_variant', 'product_variant_info',
            'quantity', 'received_quantity', 'created_by', 'created_by_username',
            'updated_by', 'updated_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_stock_transfer_info(self, obj):
        if obj.stock_transfer:
            return {
                'id': obj.stock_transfer.id,
                'source_store': obj.stock_transfer.source_store.name if obj.stock_transfer.source_store else None,
                'destination_store': obj.stock_transfer.destination_store.name if obj.stock_transfer.destination_store else None,
                'status': obj.stock_transfer.status,
                'transfer_date': obj.stock_transfer.transfer_date
            }
        return None

class StockTransferSerializer(serializers.ModelSerializer):
    source_store_info = StoreSerializer(source='source_store', read_only=True)
    destination_store_info = StoreSerializer(source='destination_store', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    details = StockTransferDetailSerializer(many=True, read_only=True)
    details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StockTransfer
        fields = [
            'id', 'source_store', 'source_store_info', 'destination_store', 'destination_store_info',
            'transfer_date', 'status', 'note', 'created_by', 'created_by_username',
            'updated_by', 'updated_by_username', 'created_at', 'updated_at',
            'details', 'details_count'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_details_count(self, obj):
        return obj.stocktransferdetail_set.count()

class StockTransferListSerializer(serializers.ModelSerializer):
    source_store_info = StoreSerializer(source='source_store', read_only=True)
    destination_store_info = StoreSerializer(source='destination_store', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StockTransfer
        fields = [
            'id', 'source_store', 'source_store_info', 'destination_store', 'destination_store_info',
            'transfer_date', 'status', 'note', 'created_by', 'created_by_username',
            'created_at', 'details_count'
        ]
        read_only_fields = ('created_at',)
    
    def get_details_count(self, obj):
        return obj.stocktransferdetail_set.count() 