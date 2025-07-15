import django_filters
from django_filters import rest_framework as filters
from apps.warranty.models.warranty import Warranty
from django.db.models import Q

class WarrantyFilter(filters.FilterSet):
    search = filters.CharFilter(method='search_filter')
    status = filters.ChoiceFilter(choices=Warranty.WARRANTY_STATUS_CHOICES)
    order_detail = filters.NumberFilter()
    product = filters.NumberFilter(field_name='order_detail__product_variant__product__id')
    variant = filters.NumberFilter(field_name='order_detail__product_variant__id')
    start_date = filters.DateFilter(field_name='warranty_start_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='warranty_start_date', lookup_expr='lte')
    store = filters.NumberFilter(field_name='order_detail__order__store__id')
    is_active = filters.BooleanFilter(method='is_active_filter')
    
    # Filter cho khách hàng
    customer_id = filters.NumberFilter(field_name='order_detail__order__customer__id')
    customer_name = filters.CharFilter(method='customer_name_filter')
    customer_phone = filters.CharFilter(field_name='order_detail__order__customer__phone', lookup_expr='icontains')
    
    class Meta:
        model = Warranty
        fields = {
            'warranty_number': ['exact', 'icontains'],
            'warranty_start_date': ['exact', 'gte', 'lte'],
            'warranty_end_date': ['exact', 'gte', 'lte'],
            'status': ['exact', 'in'],
        }
    
    def search_filter(self, queryset, name, value):
        """Tìm kiếm theo warranty_number, product name, customer name"""
        return queryset.filter(
            Q(warranty_number__icontains=value) |
            Q(order_detail__product_variant__product__name__icontains=value) |
            Q(order_detail__order__customer__first_name__icontains=value) |
            Q(order_detail__order__customer__last_name__icontains=value) |
            Q(serial_number__icontains=value)
        )
    
    def customer_name_filter(self, queryset, name, value):
        """Filter theo tên khách hàng (first_name hoặc last_name)"""
        return queryset.filter(
            Q(order_detail__order__customer__first_name__icontains=value) |
            Q(order_detail__order__customer__last_name__icontains=value)
        )
    
    def is_active_filter(self, queryset, name, value):
        """Filter theo trạng thái active"""
        if value:
            return queryset.filter(status='ACTIVE')
        else:
            return queryset.exclude(status='ACTIVE') 