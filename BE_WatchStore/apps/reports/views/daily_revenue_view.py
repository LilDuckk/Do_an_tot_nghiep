from rest_framework import viewsets
from django_filters import rest_framework as filters
from apps.reports.models.daily_revenue import DailyRevenue
from apps.reports.serializers.daily_revenue_serializer import DailyRevenueSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class DailyRevenueFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='date', lookup_expr='lte')
    store_id = filters.NumberFilter(field_name='store_id')

    class Meta:
        model = DailyRevenue
        fields = ['start_date', 'end_date', 'store_id']

class DailyRevenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyRevenue.objects.all()
    serializer_class = DailyRevenueSerializer
    permission_classes = [IsAdminUser]
    filterset_class = DailyRevenueFilter
    ordering_fields = ['date', 'total_revenue']
    ordering = ['-date']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem báo cáo doanh thu
            return [IsAuthenticated()]
        return super().get_permissions() 