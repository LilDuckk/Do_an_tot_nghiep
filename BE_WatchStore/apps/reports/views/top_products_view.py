from rest_framework import viewsets
from django_filters import rest_framework as filters
from apps.reports.models.top_products import TopProduct
from apps.reports.serializers.top_products_serializer import TopProductSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class TopProductFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='date', lookup_expr='lte')
    store_id = filters.NumberFilter(field_name='store_id')

    class Meta:
        model = TopProduct
        fields = ['start_date', 'end_date', 'store_id']

class TopProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TopProduct.objects.all()
    serializer_class = TopProductSerializer
    permission_classes = [IsAdminUser]
    filterset_class = TopProductFilter
    ordering_fields = ['total_quantity', 'total_revenue']
    ordering = ['-total_quantity']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem báo cáo sản phẩm hàng đầu
            return [IsAuthenticated()]
        return super().get_permissions() 