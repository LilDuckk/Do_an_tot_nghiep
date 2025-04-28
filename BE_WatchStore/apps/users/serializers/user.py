from rest_framework import serializers
from ..models import UserAccount
from apps.stores.serializers import StoreSerializer

class UserSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)

    class Meta:
        model = UserAccount
        fields = '__all__' 