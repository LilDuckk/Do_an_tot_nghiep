from rest_framework import serializers
from apps.content.models.banner import Banner

class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'image_url', 'link_url', 'alt_text', 
                 'start_date', 'end_date', 'display_order', 'is_active',
                 'banner_location', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_image_url(self, obj):
        """Return the URL of the uploaded image."""
        return obj.image.url if obj.image else None

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("Image file too large. Maximum size is 5MB.")
        return value