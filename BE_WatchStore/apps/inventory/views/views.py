from rest_framework import viewsets, filters, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from ..models import Inventory, InventoryTransaction, InventoryHistory
from ..serializers import InventorySerializer, InventoryTransactionSerializer, InventoryHistorySerializer
from apps.products.models import Product
from django.shortcuts import get_object_or_404
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as django_filters

class InventoryFilter(django_filters.FilterSet):
    class Meta:
        model = Inventory
        fields = {
            'product_variant': ['exact'],
            'store': ['exact'],
            'quantity': ['exact', 'gte', 'lte'],
            'last_updated': ['exact', 'gte', 'lte']
        }

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = InventoryFilter
    ordering_fields = ['quantity', 'last_updated']
    ordering = ['-last_updated']

    def get_queryset(self):
        queryset = super().get_queryset()
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location=location)
        return queryset

    @action(detail=True, methods=['post'])
    def stock_in(self, request, pk=None):
        inventory = self.get_object()
        quantity = request.data.get('quantity')
        reference = request.data.get('reference')
        notes = request.data.get('notes')

        if not quantity or quantity <= 0:
            return Response(
                {'error': 'Số lượng phải lớn hơn 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Tạo giao dịch nhập kho
            transaction_obj = InventoryTransaction.objects.create(
                inventory=inventory,
                transaction_type='in',
                quantity=quantity,
                reference=reference,
                notes=notes
            )

            # Cập nhật số lượng tồn kho
            inventory.quantity += quantity
            inventory.last_updated = timezone.now()
            inventory.save()

        serializer = InventoryTransactionSerializer(transaction_obj)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def stock_out(self, request, pk=None):
        inventory = self.get_object()
        quantity = request.data.get('quantity')
        reference = request.data.get('reference')
        notes = request.data.get('notes')

        if not quantity or quantity <= 0:
            return Response(
                {'error': 'Số lượng phải lớn hơn 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if inventory.quantity < quantity:
            return Response(
                {'error': 'Số lượng xuất vượt quá số lượng tồn kho'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Tạo giao dịch xuất kho
            transaction_obj = InventoryTransaction.objects.create(
                inventory=inventory,
                transaction_type='out',
                quantity=quantity,
                reference=reference,
                notes=notes
            )

            # Cập nhật số lượng tồn kho
            inventory.quantity -= quantity
            inventory.last_updated = timezone.now()
            inventory.save()

        serializer = InventoryTransactionSerializer(transaction_obj)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        inventory = self.get_object()
        quantity = request.data.get('quantity')
        reference = request.data.get('reference')
        notes = request.data.get('notes')

        if not quantity:
            return Response(
                {'error': 'Số lượng điều chỉnh không được để trống'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Tạo giao dịch điều chỉnh
            transaction_obj = InventoryTransaction.objects.create(
                inventory=inventory,
                transaction_type='adjust',
                quantity=quantity,
                reference=reference,
                notes=notes
            )

            # Cập nhật số lượng tồn kho
            inventory.quantity = quantity
            inventory.last_updated = timezone.now()
            inventory.save()

        serializer = InventoryTransactionSerializer(transaction_obj)
        return Response(serializer.data)

class InventoryTransactionFilter(django_filters.FilterSet):
    class Meta:
        model = InventoryTransaction
        fields = {
            'inventory': ['exact'],
            'transaction_type': ['exact'],
            'quantity': ['exact', 'gte', 'lte'],
            'unit_price': ['exact', 'gte', 'lte'],
            'reference_id': ['exact'],
            'reference_type': ['exact'],
            'transaction_date': ['exact', 'gte', 'lte']
        }

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = InventoryTransactionFilter
    ordering_fields = ['quantity', 'unit_price', 'transaction_date']
    ordering = ['-transaction_date']

class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'location']
    search_fields = ['product__name', 'location']
    ordering_fields = ['quantity', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product)

class InventoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

class InventoryTransactionListCreateView(generics.ListCreateAPIView):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['inventory', 'transaction_type']
    search_fields = ['reference', 'notes']
    ordering_fields = ['quantity', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        inventory_id = self.request.data.get('inventory')
        inventory = get_object_or_404(Inventory, id=inventory_id)
        serializer.save(inventory=inventory)

class InventoryTransactionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

class InventoryHistoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryHistory.objects.all()
    serializer_class = InventoryHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['inventory', 'transaction_type', 'employee']
    ordering_fields = ['quantity', 'created_at']
    ordering = ['-created_at'] 