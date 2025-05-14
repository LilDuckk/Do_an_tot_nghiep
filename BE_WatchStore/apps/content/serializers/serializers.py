from rest_framework import serializers
from ..models import News, NewsCategory, Banner, FooterCategory, FooterLink
from apps.users.serializers import UserSerializer

class NewsCategorySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = NewsCategory
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    category = NewsCategorySerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = News
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Banner
        fields = '__all__'

class FooterLinkSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = FooterLink
        fields = '__all__'

class FooterCategorySerializer(serializers.ModelSerializer):
    links = FooterLinkSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = FooterCategory
        fields = '__all__' 