from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, F, Count
from django_filters import rest_framework as filters
from apps.orders.models.order_detail import OrderDetail
from apps.orders.models.order import Orders
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, OR
from datetime import timedelta
from django.utils import timezone

class TopProductFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name='order__order_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='order__order_date', lookup_expr='lte')
    store_id = filters.NumberFilter(field_name='order__store_id')

    class Meta:
        model = OrderDetail
        fields = ['start_date', 'end_date', 'store_id']

class TopProductViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    filterset_class = TopProductFilter

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def list(self, request):
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        store_id = request.query_params.get('store_id')
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        order_details = OrderDetail.objects.filter(
            order__order_date__range=(start_date, end_date),
            order__status__in=['delivered', 'completed'],
            order__is_deleted=False,
            is_deleted=False
        )
        if store_id:
            order_details = order_details.filter(order__store_id=store_id)

        top_products = order_details.values(
            'product_variant__id',
            'product_variant__sku',
            'product_variant__product__name',
            'order__store_id'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('final_price')
        ).order_by('-total_quantity')[:limit]

        # Định dạng lại dữ liệu trả về
        results = [
            {
                'product_id': item['product_variant__id'],
                'sku': item['product_variant__sku'],
                'product_name': item['product_variant__product__name'],
                'store_id': item['order__store_id'],
                'total_quantity': item['total_quantity'],
                'total_revenue': float(item['total_revenue']) if item['total_revenue'] else 0
            }
            for item in top_products
        ]
        return Response(results) 