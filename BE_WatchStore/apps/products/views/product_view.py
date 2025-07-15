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
from apps.products.services import ProductService, ProductVariantService
from django.http import Http404
from apps.products.models.attribute import AttributeValue, AttributeType
from django.db import models
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_deleted=False)
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all', 'featured', 'get_attributes', 'get_variants']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết sản phẩm
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_update_variants', 'set_primary_image']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
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
        
        # Tạo filters từ query params
        filters = {
            'search': request.query_params.get('search'),
            'attr_values': request.query_params.getlist('attr_values', []),
            'is_active': request.query_params.get('is_active'),
            'sort_by': request.query_params.get('sort_by')
        }
        
        # Convert is_active string to boolean
        if filters['is_active'] is not None:
            filters['is_active'] = filters['is_active'].lower() == 'true'
        
        # Sử dụng service để lấy variants
        variants = ProductService.get_variants_for_product(product, filters)
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def get_attributes(self, request, pk=None):
        """
        Lấy danh sách attributes và values của sản phẩm
        """
        product = self.get_object()
        
        # Sử dụng service để lấy attributes
        result = ProductService.get_attributes_for_product(product)
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        # Tạo filters từ query params
        filters = {
            'category': self.request.query_params.get('category'),
            'brand': self.request.query_params.get('brand'),
            'min_price': self.request.query_params.get('min_price'),
            'max_price': self.request.query_params.get('max_price'),
            'search': self.request.query_params.get('search'),
            'featured': self.request.query_params.get('featured'),
            'is_active': self.request.query_params.get('is_active')
        }
        
        # Convert is_active string to boolean
        if filters['is_active'] is not None:
            filters['is_active'] = filters['is_active'].lower() == 'true'
        
        # Convert featured string to boolean
        if filters['featured']:
            filters['featured'] = filters['featured'].lower() == 'true'
        
        # Sử dụng service để lấy optimized queryset
        return ProductService.get_optimized_queryset(filters)

    def perform_destroy(self, instance):
        """
        Override phương thức perform_destroy để thực hiện soft delete
        """
        instance.delete()  # Sẽ gọi phương thức delete() của BaseModel
        # Clear cache sau khi xóa
        ProductService.clear_product_cache()

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
        """
        Cập nhật hàng loạt variants cho product
        """
        product = self.get_object()
        variants_data = request.data.get('variants', [])
        
        try:
            # Sử dụng service để bulk update variants
            created_variants = ProductService.bulk_update_variants(product, variants_data)
            return Response({
                'status': 'variants updated',
                'count': len(created_variants)
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

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
            # Sử dụng service để set primary image
            image = ProductService.set_primary_image(product, image_id)
            
            return Response({
                'message': 'Đã đặt ảnh chính thành công',
                'image': {
                    'id': image.id,
                    'product': image.product_id,
                    'image': image.image.url if image.image else None,
                    'is_primary': image.is_primary
                }
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết biến thể
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_images', 'delete_image']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        # Tạo filters từ query params
        filters = {
            'product_id': self.request.query_params.get('product_id'),
            'search': self.request.query_params.get('search'),
            'attr_values': self.request.query_params.getlist('attr_values', []),
            'attr_type': self.request.query_params.get('attr_type'),
            'sort_by': self.request.query_params.get('sort_by'),
            'attr_value': self.request.query_params.get('attr_value')
        }
        
        # Sử dụng service để lấy optimized queryset
        return ProductVariantService.get_optimized_queryset(filters)

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
        
        try:
            # Sử dụng service để upload images
            created_images = ProductVariantService.upload_variant_images(
                variant, images, alt_texts
            )
            serializer = VariantImageSerializer(created_images, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """
        Xóa một ảnh của biến thể
        """
        variant = self.get_object()
        image_id = request.data.get('image_id')
        
        try:
            # Sử dụng service để delete image
            ProductVariantService.delete_variant_image(variant, image_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_destroy(self, instance):
        """
        Override phương thức perform_destroy để thực hiện soft delete cho ProductVariant
        """
        instance.delete()  # Sẽ gọi phương thức delete() của BaseModel

class VariantImageViewSet(viewsets.ModelViewSet):
    queryset = VariantImage.objects.all()
    serializer_class = VariantImageSerializer
    
    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết ảnh
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
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
