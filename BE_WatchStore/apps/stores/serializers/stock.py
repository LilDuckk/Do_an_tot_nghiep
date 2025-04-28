from rest_framework import serializers
from ..models import (
    StockTransfer, StockTransferDetail,
    StockTake, StockTakeDetail
)

class StockTransferDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferDetail
        fields = '__all__'

class StockTransferSerializer(serializers.ModelSerializer):
    details = StockTransferDetailSerializer(many=True, read_only=True)

    class Meta:
        model = StockTransfer
        fields = '__all__'

class StockTakeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTakeDetail
        fields = '__all__'

class StockTakeSerializer(serializers.ModelSerializer):
    details = StockTakeDetailSerializer(many=True, read_only=True)

    class Meta:
        model = StockTake
        fields = '__all__' 