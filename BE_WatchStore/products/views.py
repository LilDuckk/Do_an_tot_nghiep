from django.shortcuts import render
from rest_framework import viewsets, status, filters, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ProductCategory, Brand, Product, ProductImage,
    Customer, Order, OrderDetail, Store, Employee,
    Inventory, StockIn, StockOut, Revenue, Attribute,
    CategoryAttribute, AttributeValue, ProductVariant,
    ProductVariantAttribute, Shipment, ProductSpecification,
    ProductReview, ProductWishlist, Coupon, Return, WarrantyCard,
    PriceHistory, Notification, LoginHistory
)
from .serializers import (
    ProductCategorySerializer, BrandSerializer, ProductSerializer,
    ProductImageSerializer, CustomerSerializer, OrderSerializer,
    OrderDetailSerializer, EmployeeSerializer, StoreSerializer,
    InventorySerializer, StockInSerializer, StockOutSerializer,
    RevenueSerializer, AttributeSerializer, CategoryAttributeSerializer,
    AttributeValueSerializer, ProductVariantSerializer, ProductVariantAttributeSerializer,
    ShipmentSerializer, ProductSpecificationSerializer, ProductReviewSerializer,
    ProductWishlistSerializer, CouponSerializer, ReturnSerializer, WarrantyCardSerializer,
    PriceHistorySerializer, NotificationSerializer, LoginHistorySerializer
)
from .permissions import IsAdminUser, IsCustomer, IsOwnerOrAdmin, IsStoreManager

# Create your views here.

# Trang khách hàng
class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.filter(is_deleted=False)
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent_id']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'display_order', 'created_at']
    ordering = ['display_order']

    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        category = self.get_object()
        subcategories = self.queryset.filter(parent_id=category.id)
        serializer = self.get_serializer(subcategories, many=True)
        return Response(serializer.data)

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.filter(is_deleted=False)
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'display_order', 'created_at']
    ordering = ['display_order']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_deleted=False)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_id', 'brand_id']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'base_price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price is not None:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(base_price__lte=max_price)
            
        return queryset

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_deleted=False)
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(is_deleted=False)
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'store_id', 'customer_id']
    search_fields = ['customer_name', 'customer_phone', 'customer_address']
    ordering_fields = ['order_date', 'total_amount', 'created_at']
    ordering = ['-order_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date is not None:
            queryset = queryset.filter(order_date__gte=start_date)
        if end_date is not None:
            queryset = queryset.filter(order_date__lte=end_date)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Không thể hủy đơn hàng ở trạng thái này'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = 'cancelled'
        order.save()
        return Response({'status': 'Đơn hàng đã được hủy'})

# Trang quản trị
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.filter(is_deleted=False)
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store_id', 'role']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_deleted=False)
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser | IsStoreManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'address', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return Store.objects.filter(manager__user=self.request.user, is_deleted=False)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser | IsStoreManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store_id', 'product_id']
    search_fields = ['product__name']
    ordering_fields = ['quantity_in_stock', 'last_restocked_date']
    ordering = ['-last_restocked_date']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return Inventory.objects.filter(store__manager__user=self.request.user)

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        inventory = self.get_object()
        quantity = request.data.get('quantity')
        reason = request.data.get('reason', '')

        if quantity is None:
            return Response(
                {'error': 'Vui lòng cung cấp số lượng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        inventory.quantity_in_stock = quantity
        inventory.last_restocked_date = timezone.now()
        inventory.save()

        return Response({
            'message': 'Đã cập nhật số lượng tồn kho',
            'new_quantity': quantity,
            'reason': reason
        })

class StockInViewSet(viewsets.ModelViewSet):
    queryset = StockIn.objects.all()
    serializer_class = StockInSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser | IsStoreManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store_id', 'product_id']
    search_fields = ['product__name', 'supplier_name']
    ordering_fields = ['stock_in_date', 'quantity', 'cost_price']
    ordering = ['-stock_in_date']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return StockIn.objects.filter(store__manager__user=self.request.user)

    def perform_create(self, serializer):
        stock_in = serializer.save()
        # Cập nhật số lượng tồn kho
        inventory, created = Inventory.objects.get_or_create(
            store_id=stock_in.store_id,
            product_id=stock_in.product_id,
            defaults={'quantity_in_stock': 0}
        )
        inventory.quantity_in_stock += stock_in.quantity
        inventory.last_restocked_date = stock_in.stock_in_date
        inventory.save()

class StockOutViewSet(viewsets.ModelViewSet):
    queryset = StockOut.objects.all()
    serializer_class = StockOutSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser | IsStoreManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store_id', 'product_id', 'employee_id']
    search_fields = ['product__name']
    ordering_fields = ['stock_out_date', 'quantity', 'sale_price']
    ordering = ['-stock_out_date']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return StockOut.objects.filter(store__manager__user=self.request.user)

    def perform_create(self, serializer):
        # Kiểm tra số lượng tồn kho
        store_id = serializer.validated_data['store_id']
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            inventory = Inventory.objects.get(store_id=store_id, product_id=product_id)
            if inventory.quantity_in_stock < quantity:
                raise serializers.ValidationError('Số lượng tồn kho không đủ')
                
            stock_out = serializer.save()
            # Cập nhật số lượng tồn kho
            inventory.quantity_in_stock -= quantity
            inventory.save()
            
        except Inventory.DoesNotExist:
            raise serializers.ValidationError('Không tìm thấy sản phẩm trong kho')

class RevenueViewSet(viewsets.ModelViewSet):
    queryset = Revenue.objects.all()
    serializer_class = RevenueSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser | IsStoreManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store_id']
    ordering_fields = ['revenue_date', 'revenue_amount']
    ordering = ['-revenue_date']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return Revenue.objects.filter(store__manager__user=self.request.user)

    @action(detail=False, methods=['get'])
    def daily_stats(self, request):
        date_param = request.query_params.get('date')
        if not date_param:
            return Response(
                {'error': 'Vui lòng cung cấp ngày'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Định dạng ngày không hợp lệ (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        revenues = Revenue.objects.filter(revenue_date=target_date)
        if not self.request.user.is_staff:
            revenues = revenues.filter(store__manager__user=self.request.user)

        stats = revenues.values('store_id').annotate(
            total_revenue=Sum('revenue_amount'),
            transaction_count=Count('id')
        )
        return Response(stats)

    @action(detail=False, methods=['get'])
    def monthly_stats(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            return Response(
                {'error': 'Vui lòng cung cấp năm và tháng'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response(
                {'error': 'Năm và tháng phải là số'},
                status=status.HTTP_400_BAD_REQUEST
            )

        revenues = Revenue.objects.filter(
            revenue_date__year=year,
            revenue_date__month=month
        )
        if not self.request.user.is_staff:
            revenues = revenues.filter(store__manager__user=self.request.user)

        stats = revenues.values('store_id').annotate(
            total_revenue=Sum('revenue_amount'),
            transaction_count=Count('id')
        )
        return Response(stats)

class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryAttributeViewSet(viewsets.ModelViewSet):
    queryset = CategoryAttribute.objects.all()
    serializer_class = CategoryAttributeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CategoryAttribute.objects.all()
        category_id = self.request.query_params.get('category_id', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AttributeValue.objects.all()
        attribute_id = self.request.query_params.get('attribute_id', None)
        if attribute_id:
            queryset = queryset.filter(attribute_id=attribute_id)
        return queryset

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProductVariant.objects.all()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

class ProductVariantAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantAttribute.objects.all()
    serializer_class = ProductVariantAttributeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProductVariantAttribute.objects.all()
        variant_id = self.request.query_params.get('variant_id', None)
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
        return queryset

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Shipment.objects.all()
        order_id = self.request.query_params.get('order_id', None)
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        return queryset

class ProductSpecificationViewSet(viewsets.ModelViewSet):
    queryset = ProductSpecification.objects.filter(is_deleted=False)
    serializer_class = ProductSpecificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_id']
    search_fields = ['name', 'value']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProductReview.objects.all()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

class ProductWishlistViewSet(viewsets.ModelViewSet):
    queryset = ProductWishlist.objects.filter(is_deleted=False)
    serializer_class = ProductWishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer_id', 'product_id']
    search_fields = ['product__name']
    ordering_fields = ['added_date']
    ordering = ['-added_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        return queryset

    @action(detail=False, methods=['post'])
    def verify(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Coupon code is required', 'is_valid': False}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            serializer = self.get_serializer(coupon)
            data = serializer.data
            data['is_valid'] = True
            return Response(data)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid or expired coupon', 'is_valid': False}, status=status.HTTP_404_NOT_FOUND)

class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_id']
    search_fields = ['reason']
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']

    def get_queryset(self):
        queryset = PriceHistory.objects.all()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read)
        return queryset

    @action(detail=True, methods=['put'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user_id', 'status']
    search_fields = ['ip_address', 'device_info']
    ordering_fields = ['login_time']
    ordering = ['-login_time']

    def get_queryset(self):
        queryset = LoginHistory.objects.all()
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.filter(is_deleted=False)
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_id', 'is_main']
    search_fields = ['image_url']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class ReturnViewSet(viewsets.ModelViewSet):
    queryset = Return.objects.filter(is_deleted=False)
    serializer_class = ReturnSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order_id', 'product_id', 'status']
    search_fields = ['reason']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        order_id = self.request.query_params.get('order_id', None)
        product_id = self.request.query_params.get('product_id', None)
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class WarrantyCardViewSet(viewsets.ModelViewSet):
    queryset = WarrantyCard.objects.filter(is_deleted=False)
    serializer_class = WarrantyCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_id', 'customer_id', 'status']
    search_fields = ['serial_number']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
