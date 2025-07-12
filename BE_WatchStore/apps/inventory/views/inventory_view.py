from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import serializers
from rest_framework import status
from django.db.models import Sum, Count, Q
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from apps.stores.models.employee import Employee

from apps.inventory.models.inventory import Inventory
from apps.inventory.serializers.inventory_serializer import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý tồn kho
    """
    queryset = Inventory.objects.filter(is_deleted=False)
    serializer_class = InventorySerializer
    permission_classes = [IsSuperUser, IsStoreEmployee]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Các trường có thể lọc
    filterset_fields = ['store', 'product_variant']
    
    # Các trường có thể tìm kiếm
    search_fields = ['product_variant__product__name', 'product_variant__sku', 'store__name']
    
    # Các trường có thể sắp xếp
    ordering_fields = ['quantity', 'last_updated', 'created_at']
    ordering = ['-last_updated']  # Mặc định sắp xếp theo thời gian cập nhật mới nhất

    def get_queryset(self):
        """
        Lọc dữ liệu tồn kho dựa trên quyền và cửa hàng của người dùng
        """
        queryset = super().get_queryset()
        user = self.request.user

        # print("=== DEBUG INVENTORY VIEW ===")
        # print(f"User ID: {user.id}")
        # print(f"Username: {user.username}")
        # print(f"Is superuser: {user.is_superuser}")
        # print(f"Has view_all_inventory: {user.has_perm('inventory.view_all_inventory')}")
        # print(f"Has view_inventory: {user.has_perm('inventory.view_inventory')}")
        
        # Nếu là superuser hoặc có quyền view_all_inventory, trả về tất cả dữ liệu
        if user.is_superuser or user.has_perm('inventory.view_all_inventory'):
            # print("Returning all inventory data")
            return queryset

        # Lấy employee của user
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # print(f"Employee found - ID: {employee.id}")
            # print(f"Store ID: {user_store.id}")
            # print(f"Store name: {user_store.name}")

            if user_store and user.has_perm('inventory.view_inventory'):
                # Chỉ trả về dữ liệu tồn kho của cửa hàng người dùng thuộc về
                filtered_queryset = queryset.filter(store=user_store)
                # print(f"Filtered inventory count: {filtered_queryset.count()}")
                # print("Returning filtered inventory data")
                return filtered_queryset
        except Employee.DoesNotExist:
            print("No employee found for this user")
            
        # Nếu người dùng không thuộc cửa hàng nào hoặc không có quyền view_inventory, trả về queryset rỗng
        print("Returning empty queryset")
        return Inventory.objects.none()

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng có quyền xem danh sách và chi tiết tồn kho
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_variant = serializer.validated_data['product_variant']
        store = serializer.validated_data['store']
        existing = Inventory.objects.filter(product_variant=product_variant, store=store).first()
        if existing:
            if existing.is_deleted:
                # Khôi phục bản ghi đã xóa mềm và cập nhật lại dữ liệu
                existing.is_deleted = False
                existing.quantity = serializer.validated_data.get('quantity', existing.quantity)
                existing.updated_by = request.user
                existing.save()
                serializer.instance = existing
                response_serializer = self.get_serializer(existing)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                raise serializers.ValidationError("Tồn kho cho biến thể này tại cửa hàng này đã tồn tại.")
        # Nếu không có bản ghi nào, tạo mới như bình thường
        serializer.save(created_by=request.user, updated_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        """
        Tự động gán người cập nhật khi cập nhật
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='list_all', url_name='list_all')
    def list_all(self, request):
        """
        Lấy tất cả tồn kho (không phân trang) với khả năng tìm kiếm và lọc
        """
        queryset = self.get_queryset()
        
        # Áp dụng bộ lọc
        queryset = self.filter_queryset(queryset)
        
        # Áp dụng tìm kiếm
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                product_variant__product__name__icontains=search_query
            ) | queryset.filter(
                product_variant__sku__icontains=search_query
            ) | queryset.filter(
                store__name__icontains=search_query
            )
        
        # Áp dụng sắp xếp
        ordering = request.query_params.get('ordering', '-last_updated')
        if ordering:
            queryset = queryset.order_by(ordering)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='store_inventory', url_name='store_inventory')
    def store_inventory(self, request):
        """
        Lấy danh sách sản phẩm trong kho của một cửa hàng nhất định
        """
        store_id = request.query_params.get('store_id')
        search_query = request.query_params.get('search', None)
        min_quantity = request.query_params.get('min_quantity', None)
        max_quantity = request.query_params.get('max_quantity', None)
        in_stock_only = request.query_params.get('in_stock_only', 'false').lower() == 'true'
        out_of_stock_only = request.query_params.get('out_of_stock_only', 'false').lower() == 'true'
        ordering = request.query_params.get('ordering', '-last_updated')
        
        # Lấy queryset cơ bản
        queryset = self.get_queryset()
        
        # Lọc theo cửa hàng
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        # Lọc theo tìm kiếm
        if search_query:
            queryset = queryset.filter(
                Q(product_variant__product__name__icontains=search_query) |
                Q(product_variant__sku__icontains=search_query) |
                Q(product_variant__name__icontains=search_query)
            )
        
        # Lọc theo số lượng tối thiểu
        if min_quantity is not None:
            queryset = queryset.filter(quantity__gte=int(min_quantity))
        
        # Lọc theo số lượng tối đa
        if max_quantity is not None:
            queryset = queryset.filter(quantity__lte=int(max_quantity))
        
        # Lọc chỉ sản phẩm còn hàng
        if in_stock_only:
            queryset = queryset.filter(quantity__gt=0)
        
        # Lọc chỉ sản phẩm hết hàng
        if out_of_stock_only:
            queryset = queryset.filter(quantity=0)
        
        # Sắp xếp
        if ordering:
            queryset = queryset.order_by(ordering)
        
        serializer = self.get_serializer(queryset, many=True)
        
        # Thống kê tổng quan
        total_products = queryset.count()
        total_quantity = queryset.aggregate(total=Sum('quantity'))['total'] or 0
        in_stock_count = queryset.filter(quantity__gt=0).count()
        out_of_stock_count = queryset.filter(quantity=0).count()
        low_stock_count = queryset.filter(quantity__gt=0, quantity__lte=10).count()
        
        return Response({
            'store_id': store_id,
            'filters': {
                'search': search_query,
                'min_quantity': min_quantity,
                'max_quantity': max_quantity,
                'in_stock_only': in_stock_only,
                'out_of_stock_only': out_of_stock_only,
                'ordering': ordering
            },
            'statistics': {
                'total_products': total_products,
                'total_quantity': total_quantity,
                'in_stock_count': in_stock_count,
                'out_of_stock_count': out_of_stock_count,
                'low_stock_count': low_stock_count
            },
            'inventory_items': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='store_statistics', url_name='store_statistics')
    def store_statistics(self, request):
        """
        Thống kê tồn kho của một cửa hàng
        """
        store_id = request.query_params.get('store_id')
        
        if not store_id:
            return Response({
                'error': 'store_id là bắt buộc'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(store_id=store_id)
        
        # Thống kê tổng quan
        total_products = queryset.count()
        total_quantity = queryset.aggregate(total=Sum('quantity'))['total'] or 0
        total_value = queryset.aggregate(
            total_value=Sum('quantity' * 'product_variant__product__base_price')
        )['total_value'] or 0
        
        # Thống kê theo trạng thái tồn kho
        in_stock_count = queryset.filter(quantity__gt=0).count()
        out_of_stock_count = queryset.filter(quantity=0).count()
        low_stock_count = queryset.filter(quantity__gt=0, quantity__lte=10).count()
        
        # Thống kê theo danh mục sản phẩm
        category_stats = queryset.values(
            'product_variant__product__category__name'
        ).annotate(
            product_count=Count('id'),
            total_quantity=Sum('quantity'),
            total_value=Sum('quantity' * 'product_variant__product__base_price')
        ).order_by('-total_quantity')
        
        # Thống kê theo thương hiệu
        brand_stats = queryset.values(
            'product_variant__product__brand__name'
        ).annotate(
            product_count=Count('id'),
            total_quantity=Sum('quantity'),
            total_value=Sum('quantity' * 'product_variant__product__base_price')
        ).order_by('-total_quantity')
        
        # Top sản phẩm có số lượng cao nhất
        top_products = queryset.order_by('-quantity')[:10].values(
            'product_variant__product__name',
            'product_variant__name',
            'product_variant__sku',
            'quantity',
            'last_updated'
        )
        
        # Sản phẩm sắp hết hàng (số lượng <= 10)
        low_stock_products = queryset.filter(
            quantity__gt=0, 
            quantity__lte=10
        ).order_by('quantity').values(
            'product_variant__product__name',
            'product_variant__name',
            'product_variant__sku',
            'quantity',
            'last_updated'
        )
        
        # Sản phẩm hết hàng
        out_of_stock_products = queryset.filter(
            quantity=0
        ).order_by('-last_updated').values(
            'product_variant__product__name',
            'product_variant__name',
            'product_variant__sku',
            'quantity',
            'last_updated'
        )
        
        return Response({
            'store_id': store_id,
            'overview': {
                'total_products': total_products,
                'total_quantity': total_quantity,
                'total_value': float(total_value),
                'in_stock_count': in_stock_count,
                'out_of_stock_count': out_of_stock_count,
                'low_stock_count': low_stock_count
            },
            'category_statistics': list(category_stats),
            'brand_statistics': list(brand_stats),
            'top_products': list(top_products),
            'low_stock_products': list(low_stock_products),
            'out_of_stock_products': list(out_of_stock_products)
        })

    @action(detail=False, methods=['get'], url_path='product_search', url_name='product_search')
    def product_search(self, request):
        """
        Tìm kiếm sản phẩm trong kho theo tên, SKU, hoặc mô tả
        """
        query = request.query_params.get('q', '')
        store_id = request.query_params.get('store_id')
        limit = int(request.query_params.get('limit', 20))
        
        if not query:
            return Response({
                'error': 'Tham số q (query) là bắt buộc'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset()
        
        # Lọc theo cửa hàng nếu có
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        # Tìm kiếm theo nhiều trường
        queryset = queryset.filter(
            Q(product_variant__product__name__icontains=query) |
            Q(product_variant__name__icontains=query) |
            Q(product_variant__sku__icontains=query) |
            Q(product_variant__product__description__icontains=query)
        )
        
        # Giới hạn kết quả
        queryset = queryset[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'query': query,
            'store_id': store_id,
            'total_results': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='low_stock_alert', url_name='low_stock_alert')
    def low_stock_alert(self, request):
        """
        Cảnh báo sản phẩm sắp hết hàng
        """
        store_id = request.query_params.get('store_id')
        threshold = int(request.query_params.get('threshold', 10))
        
        queryset = self.get_queryset()
        
        # Lọc theo cửa hàng nếu có
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        # Lọc sản phẩm có số lượng <= threshold và > 0
        low_stock_items = queryset.filter(
            quantity__gt=0,
            quantity__lte=threshold
        ).order_by('quantity')
        
        # Lọc sản phẩm hết hàng
        out_of_stock_items = queryset.filter(quantity=0).order_by('-last_updated')
        
        low_stock_serializer = self.get_serializer(low_stock_items, many=True)
        out_of_stock_serializer = self.get_serializer(out_of_stock_items, many=True)
        
        return Response({
            'store_id': store_id,
            'threshold': threshold,
            'low_stock_count': low_stock_items.count(),
            'out_of_stock_count': out_of_stock_items.count(),
            'low_stock_items': low_stock_serializer.data,
            'out_of_stock_items': out_of_stock_serializer.data
        })

    @action(detail=False, methods=['get'], url_path='store_variants', url_name='store_variants')
    def store_variants(self, request):
        """
        Lấy danh sách các biến thể sản phẩm tồn kho của một cửa hàng
        """
        store_id = request.query_params.get('store_id')
        in_stock_only = request.query_params.get('in_stock_only', 'false').lower() == 'true'
        search_query = request.query_params.get('search', None)
        ordering = request.query_params.get('ordering', 'product_variant__product__name')
        
        if not store_id:
            return Response({
                'error': 'store_id là bắt buộc'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Lấy queryset cơ bản
        queryset = self.get_queryset().filter(store_id=store_id)
        
        # Lọc chỉ các inventory items có product_variant hợp lệ
        queryset = queryset.filter(product_variant__isnull=False)
        
        # Lọc chỉ sản phẩm còn hàng nếu được yêu cầu
        if in_stock_only:
            queryset = queryset.filter(quantity__gt=0)
        
        # Lọc theo tìm kiếm
        if search_query:
            queryset = queryset.filter(
                Q(product_variant__product__name__icontains=search_query) |
                Q(product_variant__sku__icontains=search_query) |
                Q(product_variant__product__description__icontains=search_query)
            )
        
        # Sắp xếp
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Lấy danh sách các biến thể sản phẩm
        variants_data = []
        for inventory_item in queryset:
            variant = inventory_item.product_variant
            
            # Kiểm tra nếu variant là None
            if variant is None:
                continue
            
            # Lấy attribute values
            attribute_values = []
            attribute_values_detail = []
            
            try:
                for attr_value in variant.attribute_values.select_related('attribute_type').all():
                    attribute_values.append(attr_value.id)
                    attribute_values_detail.append({
                        'id': attr_value.id,
                        'value': attr_value.value,
                        'attribute_type': {
                            'id': attr_value.attribute_type.id,
                            'name': attr_value.attribute_type.name
                        }
                    })
            except Exception as e:
                # Log lỗi và tiếp tục với attribute_values rỗng
                print(f"Error getting attribute values for variant {variant.id}: {e}")
                attribute_values = []
                attribute_values_detail = []
            
            # Tạo dữ liệu biến thể
            try:
                variant_data = {
                    'id': variant.id,
                    'product': variant.product.id if variant.product else None,
                    'product_name': variant.product.name if variant.product else None,
                    'sku': variant.sku,
                    'price_adjustment': str(variant.price_adjustment) if variant.price_adjustment else None,
                    'barcode': variant.barcode,
                    'is_active': variant.is_active,
                    'attribute_values': attribute_values,
                    'attribute_values_detail': attribute_values_detail,
                    'warranty_period': variant.warranty_period,
                    'effective_warranty_period': variant.get_warranty_period() if hasattr(variant, 'get_warranty_period') else None,
                    'quantity': inventory_item.quantity,
                    'last_updated': inventory_item.last_updated
                }
            except Exception as e:
                # Log lỗi và bỏ qua variant này
                print(f"Error creating variant data for variant {variant.id}: {e}")
                continue
            
            variants_data.append(variant_data)
        
        return Response({
            'store_id': store_id,
            'filters': {
                'in_stock_only': in_stock_only,
                'search': search_query,
                'ordering': ordering
            },
            'total_variants': len(variants_data),
            'total_inventory_items': queryset.count(),
            'variants': variants_data
        })

    def update(self, request, *args, **kwargs):
        # Chỉ cho phép cập nhật trường quantity
        allowed_fields = {'quantity'}
        data_keys = set(request.data.keys())
        if not data_keys.issubset(allowed_fields):
            return Response({
                'detail': 'Chỉ được phép cập nhật trường quantity.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Chỉ cho phép cập nhật trường quantity
        allowed_fields = {'quantity'}
        data_keys = set(request.data.keys())
        if not data_keys.issubset(allowed_fields):
            return Response({
                'detail': 'Chỉ được phép cập nhật trường quantity.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs) 