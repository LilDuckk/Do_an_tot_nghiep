from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.core.cache import cache
from django.db.models import Q, Count, Q
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant, VariantImage
from apps.products.serializers.product_serializer import (
    ProductSerializer, ProductDetailSerializer,
    ProductVariantSerializer, VariantImageSerializer
)
from apps.products.serializers.product_image_serializer import ProductImageSerializer
from apps.products.utils import convert_to_png
from django.http import Http404
from apps.products.models.attribute import AttributeValue, AttributeType
from django.db import models
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated, AllowAny

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_deleted=False)
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    
    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all', 'featured', 'get_attributes', 'get_variants']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết sản phẩm
            return [AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return self.serializer_class
    
    def get_object(self):
        """
        Override để chỉ lấy object chưa bị xóa
        """
        obj = super().get_object()
        if obj.is_deleted:
            raise Http404("Không tìm thấy sản phẩm")
        return obj
    
    @action(detail=True, methods=['get'])
    def get_variants(self, request, pk=None):
        """
        Lấy danh sách biến thể của một sản phẩm
        """
        product = self.get_object()
        variants = product.variants.filter(is_deleted=False).select_related(
            'product'
        ).prefetch_related(
            'attribute_values',
            'attribute_values__attribute_type',
            'images'
        ).order_by('-id')

        # Tìm kiếm theo giá trị thuộc tính
        search = request.query_params.get('search', None)
        if search:
            variants = variants.filter(
                Q(attribute_values__value__icontains=search) |
                Q(sku__icontains=search)
            ).distinct()

        # Lọc theo thuộc tính
        attr_values = request.query_params.getlist('attr_values', [])
        if attr_values:
            for value in attr_values:
                variants = variants.filter(
                    attribute_values__value__icontains=value
                ).distinct()

        # Lọc theo trạng thái
        is_active = request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            variants = variants.filter(is_active=is_active_bool)

        # Sắp xếp
        sort_by = request.query_params.get('sort_by', None)
        if sort_by == 'sku':
            variants = variants.order_by('sku')
        elif sort_by == '-sku':
            variants = variants.order_by('-sku')
        elif sort_by == 'price':
            variants = variants.order_by('price_adjustment')
        elif sort_by == '-price':
            variants = variants.order_by('-price_adjustment')

        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def get_attributes(self, request, pk=None):
        """
        Lấy danh sách attributes và values của sản phẩm
        """
        product = self.get_object()
        
        # Lấy tất cả variants của sản phẩm
        variants = product.variants.filter(is_deleted=False)
        
        # Lấy tất cả attribute values từ các variants
        attribute_values = AttributeValue.objects.filter(
            variants__in=variants,
            is_deleted=False
        ).distinct()
        
        # Nhóm các values theo attribute type
        result = []
        for attr_type in attribute_values.values_list('attribute_type', flat=True).distinct():
            attr = AttributeType.objects.get(id=attr_type)
            values = attribute_values.filter(attribute_type=attr)
            
            attr_data = {
                'id': attr.id,
                'name': attr.name,
                'description': attr.description,
                'values': [
                    {
                        'id': value.id,
                        'value': value.value
                    }
                    for value in values
                ]
            }
            result.append(attr_data)
            
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
            
        # Filter by brand
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(brand_id=brand)
            
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
            
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
            
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured:
            queryset = queryset.filter(is_featured=True)
            
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            # Chuyển đổi string 'true'/'false' thành boolean
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
            
        # Sắp xếp theo ngày tạo và cập nhật mới nhất
        queryset = queryset.order_by('-updated_at', '-created_at')
        
        # Add caching for frequently accessed products
        cache_key = f'product_list_{self.request.query_params.urlencode()}'
        cached_queryset = cache.get(cache_key)
        
        if cached_queryset is None:
            cached_queryset = queryset.select_related(
                'category', 'brand', 'default_variant'
            ).prefetch_related(
                'variants', 'variants__attribute_values',
                'images'
            )
            cache.set(cache_key, cached_queryset, timeout=300)  # Cache for 5 minutes
            
        return cached_queryset

    def perform_destroy(self, instance):
        """
        Override phương thức perform_destroy để thực hiện soft delete
        """
        instance.delete()  # Sẽ gọi phương thức delete() của BaseModel

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def bulk_update_variants(self, request, pk=None):
        product = self.get_object()
        variants_data = request.data.get('variants', [])
        
        with transaction.atomic():
            # Delete existing variants
            product.variants.all().delete()
            
            # Create new variants
            for variant_data in variants_data:
                attribute_values = variant_data.pop('attribute_values', [])
                variant = ProductVariant.objects.create(product=product, **variant_data)
                variant.attribute_values.set(attribute_values)
                variant.sku = variant.generate_sku()
                variant.save()
                    
        return Response({'status': 'variants updated'})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        """
        Đặt ảnh chính cho sản phẩm
        """
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        try:
            # Lấy ảnh cần đặt làm ảnh chính
            image = product.images.get(id=image_id)
            
            # Cập nhật tất cả ảnh của sản phẩm thành không phải ảnh chính
            product.images.all().update(is_primary=False)
            
            # Đặt ảnh được chọn làm ảnh chính
            image.is_primary = True
            image.save()
            
            return Response({
                'message': 'Đã đặt ảnh chính thành công',
                'image': {
                    'id': image.id,
                    'product': image.product_id,
                    'image': image.image.url if image.image else None,
                    'is_primary': image.is_primary
                }
            })
            
        except product.images.model.DoesNotExist:
            return Response(
                {'error': 'Không tìm thấy ảnh'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết biến thể
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'product'
        ).prefetch_related(
            'attribute_values',
            'attribute_values__attribute_type',
            'images'
        ).order_by('-id')  # Sắp xếp theo ID giảm dần

        # Tìm kiếm theo tên sản phẩm
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(product__name__icontains=search) |
                Q(attribute_values__value__icontains=search)
            ).distinct()

        # Tìm kiếm theo nhiều thuộc tính
        attr_values = self.request.query_params.getlist('attr_values', [])
        if attr_values:
            # Tạo subquery để lấy các variant có chứa tất cả các giá trị thuộc tính
            for value in attr_values:
                subquery = ProductVariant.objects.filter(
                    attribute_values__value__icontains=value
                ).values('id')
                queryset = queryset.filter(id__in=subquery)

        # Tìm kiếm theo loại thuộc tính
        attr_type = self.request.query_params.get('attr_type', None)
        if attr_type:
            queryset = queryset.filter(attribute_values__attribute_type__name__icontains=attr_type)

        # Sắp xếp theo product name
        sort_by = self.request.query_params.get('sort_by', None)
        if sort_by == 'product_name':
            queryset = queryset.order_by('product__name', '-id')
        elif sort_by == '-product_name':
            queryset = queryset.order_by('-product__name', '-id')
        
        # Sắp xếp theo attribute value
        attr_value = self.request.query_params.get('attr_value', None)
        if attr_value:
            queryset = queryset.filter(attribute_values__value__icontains=attr_value)
            queryset = queryset.order_by('attribute_values__value', '-id')

        return queryset.distinct()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """
        Upload nhiều ảnh cho biến thể
        """
        variant = self.get_object()
        images = request.FILES.getlist('images')
        alt_texts = request.data.getlist('alt_texts', [])
        
        created_images = []
        for idx, image in enumerate(images):
            alt_text = alt_texts[idx] if idx < len(alt_texts) else ''
            # Chuyển đổi ảnh sang PNG
            png_image = convert_to_png(image)
            variant_image = VariantImage.objects.create(
                variant=variant,
                image=png_image,
                alt_text=alt_text
            )
            created_images.append(variant_image)
            
        serializer = VariantImageSerializer(created_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """
        Xóa một ảnh của biến thể
        """
        variant = self.get_object()
        image_id = request.data.get('image_id')
        
        try:
            image = variant.images.get(id=image_id)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except VariantImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class VariantImageViewSet(viewsets.ModelViewSet):
    queryset = VariantImage.objects.all()
    serializer_class = VariantImageSerializer
    permission_classes = [IsAdminUser]
    
    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết ảnh
            return [AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset().select_related('variant', 'variant__product')
        
        # Lọc theo variant
        variant_id = self.request.query_params.get('variant', None)
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
            
        # Lọc theo product
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(variant__product_id=product_id)
            
        return queryset.order_by('-id')  # Sắp xếp theo ID giảm dần

    def perform_create(self, serializer):
        # Chuyển đổi ảnh sang PNG trước khi lưu
        image = self.request.FILES.get('image')
        if image:
            png_image = convert_to_png(image)
            serializer.save(image=png_image)
        else:
            serializer.save()
