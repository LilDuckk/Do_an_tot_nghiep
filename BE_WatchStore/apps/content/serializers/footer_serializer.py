from rest_framework import serializers
from apps.content.models.footer import FooterCategory, FooterLink


class FooterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterCategory
        fields = [
            'id',
            'name',
            'display_order',
            'is_active',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
        ]


class FooterLinkSerializer(serializers.ModelSerializer):
    # Hiển thị luôn thông tin category kèm theo (tùy chọn, bạn có thể bỏ nếu chỉ cần ID)
    category = FooterCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=FooterCategory.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = FooterLink
        fields = [
            'id',
            'category',
            'category_id',
            'title',
            'url',
            'display_order',
            'is_active',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
        ]
