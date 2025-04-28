from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models import (
    Store, Employee, Supplier,
    PurchaseOrder, PurchaseOrderDetail,
    StockTransfer, StockTransferDetail,
    StockTake, StockTakeDetail
)
from ..serializers import (
    StoreSerializer, EmployeeSerializer,
    SupplierSerializer, PurchaseOrderSerializer,
    PurchaseOrderDetailSerializer, StockTransferSerializer,
    StockTransferDetailSerializer, StockTakeSerializer,
    StockTakeDetailSerializer
)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'manager']
    search_fields = ['name', 'address', 'store_code']
    ordering_fields = ['name', 'opening_date', 'created_at']
    ordering = ['-created_at']

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'position', 'is_deleted']
    search_fields = ['first_name', 'last_name', 'employee_code', 'phone']
    ordering_fields = ['hire_date', 'created_at']
    ordering = ['last_name', 'first_name']

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'contact_person', 'email', 'phone', 'tax_code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'store', 'status']
    search_fields = ['note']
    ordering_fields = ['order_date', 'expected_delivery_date', 'total_amount', 'created_at']
    ordering = ['-order_date']

class PurchaseOrderDetailViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderDetail.objects.all()
    serializer_class = PurchaseOrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['purchase_order', 'product_variant']
    ordering_fields = ['quantity', 'unit_price', 'created_at']
    ordering = ['id']

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_store', 'destination_store', 'status']
    search_fields = ['note']
    ordering_fields = ['transfer_date', 'created_at']
    ordering = ['-transfer_date']

class StockTransferDetailViewSet(viewsets.ModelViewSet):
    queryset = StockTransferDetail.objects.all()
    serializer_class = StockTransferDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stock_transfer', 'product_variant']
    ordering_fields = ['quantity', 'received_quantity', 'created_at']
    ordering = ['id']

class StockTakeViewSet(viewsets.ModelViewSet):
    queryset = StockTake.objects.all()
    serializer_class = StockTakeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'status']
    search_fields = ['notes']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

class StockTakeDetailViewSet(viewsets.ModelViewSet):
    queryset = StockTakeDetail.objects.all()
    serializer_class = StockTakeDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stock_take', 'product_variant']
    search_fields = ['notes']
    ordering_fields = ['expected_quantity', 'actual_quantity', 'discrepancy', 'created_at']
    ordering = ['id'] 