from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from datetime import datetime, timedelta, timezone as dt_timezone
from django.utils import timezone as django_timezone
from django.utils.timezone import make_aware
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.reports.models.daily_revenue import DailyRevenue
from apps.reports.serializers.daily_revenue_serializer import DailyRevenueSerializer
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.models.inventory import Inventory
from apps.stores.models.store import Store
from apps.products.models.variant import ProductVariant
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, OR

class DailyRevenueFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='date', lookup_expr='lte')
    store = filters.NumberFilter(field_name='store_id')

    class Meta:
        model = DailyRevenue
        fields = ['start_date', 'end_date', 'store']

class DailyRevenueViewSet(viewsets.ModelViewSet):
    queryset = DailyRevenue.objects.all()
    serializer_class = DailyRevenueSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DailyRevenueFilter
    search_fields = ['store__name']
    ordering_fields = ['date', 'revenue', 'created_at']
    ordering = ['-date']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def calculate_daily_revenue(self, request):
        """Tính toán doanh thu theo ngày từ dữ liệu thực tế"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store_id = request.query_params.get('store')
        
        # Mặc định là 30 ngày gần nhất
        if not start_date:
            start_date = (django_timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = django_timezone.now().strftime('%Y-%m-%d')
        
        # Chuyển đổi string thành datetime với timezone
        start_datetime = make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end_datetime = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        
        # Query orders trong khoảng thời gian
        orders_query = Orders.objects.filter(
            order_date__range=(start_datetime, end_datetime),
            status__in=['delivered', 'completed'],
            is_deleted=False
        )
        
        if store_id:
            orders_query = orders_query.filter(store_id=store_id)
        
        # Tính doanh thu theo ngày
        daily_revenues = []
        current_date = start_datetime.date()
        end_date_obj = end_datetime.date()
        
        while current_date <= end_date_obj:
            # Doanh thu từ orders
            day_orders = orders_query.filter(
                order_date__date=current_date
            )
            order_revenue = day_orders.aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            # Số lượng đơn hàng
            order_count = day_orders.count()
            
            # Số lượng sản phẩm bán ra
            sold_products = OrderDetail.objects.filter(
                order__in=day_orders,
                is_deleted=False
            ).aggregate(
                total_quantity=Sum('quantity')
            )['total_quantity'] or 0
            
            # Thống kê inventory transactions
            inventory_stats = InventoryTransaction.objects.filter(
                created_at__date=current_date,
                transaction_type='OUT',
                reference_type='order'
            ).aggregate(
                total_quantity=Sum('quantity'),
                total_value=Sum(F('quantity') * F('unit_price'))
            )
            
            daily_revenues.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'order_revenue': float(order_revenue),
                'order_count': order_count,
                'sold_products': sold_products,
                'inventory_out_quantity': inventory_stats['total_quantity'] or 0,
                'inventory_out_value': float(inventory_stats['total_value'] or 0)
            })
            
            current_date += timedelta(days=1)
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'daily_revenues': daily_revenues,
            'summary': {
                'total_revenue': sum(r['order_revenue'] for r in daily_revenues),
                'total_orders': sum(r['order_count'] for r in daily_revenues),
                'total_products_sold': sum(r['sold_products'] for r in daily_revenues)
            }
        })

    @action(detail=False, methods=['get'])
    def inventory_analysis(self, request):
        """Phân tích tồn kho và doanh thu"""
        store_id = request.query_params.get('store')
        days = int(request.query_params.get('days', 30))
        
        end_date = django_timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Query inventory transactions
        transactions_query = InventoryTransaction.objects.filter(
            created_at__range=(start_date, end_date)
        )
        
        if store_id:
            transactions_query = transactions_query.filter(inventory__store_id=store_id)
        
        # Thống kê theo loại transaction
        transaction_stats = transactions_query.values('transaction_type').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity'),
            total_value=Sum(F('quantity') * F('unit_price'))
        )
        
        # Thống kê theo sản phẩm
        product_stats = transactions_query.values(
            'inventory__product_variant__sku',
            'inventory__product_variant__product__name'
        ).annotate(
            in_quantity=Sum('quantity', filter=Q(transaction_type='IN')),
            out_quantity=Sum('quantity', filter=Q(transaction_type='OUT')),
            in_value=Sum(F('quantity') * F('unit_price'), filter=Q(transaction_type='IN')),
            out_value=Sum(F('quantity') * F('unit_price'), filter=Q(transaction_type='OUT'))
        )
        
        # Thống kê theo cửa hàng
        store_stats = transactions_query.values('inventory__store__name').annotate(
            in_quantity=Sum('quantity', filter=Q(transaction_type='IN')),
            out_quantity=Sum('quantity', filter=Q(transaction_type='OUT')),
            in_value=Sum(F('quantity') * F('unit_price'), filter=Q(transaction_type='IN')),
            out_value=Sum(F('quantity') * F('unit_price'), filter=Q(transaction_type='OUT'))
        )
        
        return Response({
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': days
            },
            'transaction_statistics': transaction_stats,
            'product_statistics': product_stats,
            'store_statistics': store_stats
        })

    @action(detail=False, methods=['get'])
    def revenue_forecast(self, request):
        """Dự báo doanh thu dựa trên dữ liệu lịch sử"""
        days = int(request.query_params.get('days', 7))
        store_id = request.query_params.get('store')
        
        # Lấy dữ liệu 30 ngày gần nhất để dự báo
        end_date = django_timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Query doanh thu theo ngày
        orders_query = Orders.objects.filter(
            order_date__range=(start_date, end_date),
            status__in=['delivered', 'completed'],
            is_deleted=False
        )
        
        if store_id:
            orders_query = orders_query.filter(store_id=store_id)
        
        daily_revenues = orders_query.values('order_date__date').annotate(
            revenue=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('order_date__date')
        
        # Tính trung bình doanh thu
        total_revenue = sum(item['revenue'] for item in daily_revenues)
        total_days = len(daily_revenues) if daily_revenues else 1
        avg_daily_revenue = total_revenue / total_days
        
        # Dự báo doanh thu cho n ngày tới
        forecast = []
        current_date = django_timezone.now().date()
        
        for i in range(1, days + 1):
            forecast_date = current_date + timedelta(days=i)
            forecast.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'predicted_revenue': float(avg_daily_revenue),
                'confidence': 0.8  # Độ tin cậy dự báo
            })
        
        return Response({
            'historical_data': {
                'total_revenue': float(total_revenue),
                'total_days': total_days,
                'average_daily_revenue': float(avg_daily_revenue),
                'daily_revenues': list(daily_revenues)
            },
            'forecast': {
                'days': days,
                'predictions': forecast,
                'total_predicted_revenue': float(avg_daily_revenue * days)
            }
        })

    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """Top sản phẩm bán chạy"""
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        store_id = request.query_params.get('store')
        
        end_date = django_timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Query từ order details
        order_details_query = OrderDetail.objects.filter(
            order__order_date__range=(start_date, end_date),
            order__status__in=['delivered', 'completed'],
            order__is_deleted=False,
            is_deleted=False
        )
        
        if store_id:
            order_details_query = order_details_query.filter(order__store_id=store_id)
        
        top_products = order_details_query.values(
            'product_variant__sku',
            'product_variant__product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('final_price'),
            order_count=Count('order', distinct=True)
        ).order_by('-total_revenue')[:limit]
        
        # Query từ inventory transactions
        inventory_query = InventoryTransaction.objects.filter(
            created_at__range=(start_date, end_date),
            transaction_type='OUT',
            reference_type='order'
        )
        
        if store_id:
            inventory_query = inventory_query.filter(inventory__store_id=store_id)
        
        top_products_inventory = inventory_query.values(
            'inventory__product_variant__sku',
            'inventory__product_variant__product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_value=Sum(F('quantity') * F('unit_price'))
        ).order_by('-total_value')[:limit]
        
        return Response({
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': days
            },
            'top_products_by_revenue': list(top_products),
            'top_products_by_inventory': list(top_products_inventory)
        })

    @action(detail=False, methods=['get'])
    def store_performance(self, request):
        """Hiệu suất cửa hàng"""
        days = int(request.query_params.get('days', 30))
        
        end_date = django_timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Thống kê theo cửa hàng
        store_performance = Store.objects.annotate(
            total_orders=Count(
                'orders',
                filter=Q(
                    orders__order_date__range=(start_date, end_date),
                    orders__status__in=['delivered', 'completed'],
                    orders__is_deleted=False
                )
            ),
            total_revenue=Sum(
                'orders__total_amount',
                filter=Q(
                    orders__order_date__range=(start_date, end_date),
                    orders__status__in=['delivered', 'completed'],
                    orders__is_deleted=False
                )
            ),
            total_products_sold=Sum(
                'orders__orderdetail__quantity',
                filter=Q(
                    orders__order_date__range=(start_date, end_date),
                    orders__status__in=['delivered', 'completed'],
                    orders__is_deleted=False,
                    orders__orderdetail__is_deleted=False
                )
            ),
            inventory_in=Sum(
                'inventory__inventorytransaction__quantity',
                filter=Q(
                    inventory__inventorytransaction__created_at__range=(start_date, end_date),
                    inventory__inventorytransaction__transaction_type='IN'
                )
            ),
            inventory_out=Sum(
                'inventory__inventorytransaction__quantity',
                filter=Q(
                    inventory__inventorytransaction__created_at__range=(start_date, end_date),
                    inventory__inventorytransaction__transaction_type='OUT'
                )
            )
        ).values(
            'id', 'name', 'address', 'phone', 'store_code'
        )
        
        return Response({
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': days
            },
            'store_performance': list(store_performance)
        })

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Tóm tắt doanh thu theo ngày"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store_id = request.query_params.get('store')
        
        # Mặc định là 30 ngày gần nhất
        if not start_date:
            start_date = (django_timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = django_timezone.now().strftime('%Y-%m-%d')
        
        # Chuyển đổi string thành datetime với timezone
        start_datetime = make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end_datetime = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        
        # Query orders trong khoảng thời gian
        orders_query = Orders.objects.filter(
            order_date__range=(start_datetime, end_datetime),
            status__in=['delivered', 'completed'],
            is_deleted=False
        )
        
        if store_id:
            orders_query = orders_query.filter(store_id=store_id)
        
        # Tính tổng doanh thu
        total_revenue = orders_query.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Số lượng đơn hàng
        total_orders = orders_query.count()
        
        # Số lượng sản phẩm bán ra
        total_products_sold = OrderDetail.objects.filter(
            order__in=orders_query,
            is_deleted=False
        ).aggregate(
            total_quantity=Sum('quantity')
        )['total_quantity'] or 0
        
        # Doanh thu trung bình mỗi đơn hàng
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Thống kê theo ngày
        daily_stats = orders_query.values('order_date__date').annotate(
            revenue=Sum('total_amount'),
            order_count=Count('id'),
            product_count=Sum('orderdetail__quantity')
        ).order_by('order_date__date')
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'total_products_sold': total_products_sold,
                'average_order_value': float(avg_order_value)
            },
            'daily_stats': list(daily_stats)
        })

    @action(detail=False, methods=['get'])
    def daily_breakdown(self, request):
        """Phân tích chi tiết doanh thu theo ngày"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store_id = request.query_params.get('store')
        
        # Mặc định là 30 ngày gần nhất
        if not start_date:
            start_date = (django_timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = django_timezone.now().strftime('%Y-%m-%d')
        
        # Chuyển đổi string thành datetime với timezone
        start_datetime = make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end_datetime = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        
        # Query orders trong khoảng thời gian
        orders_query = Orders.objects.filter(
            order_date__range=(start_datetime, end_datetime),
            status__in=['delivered', 'completed'],
            is_deleted=False
        )
        
        if store_id:
            orders_query = orders_query.filter(store_id=store_id)
        
        # Phân tích theo ngày
        daily_breakdown = []
        current_date = start_datetime.date()
        end_date_obj = end_datetime.date()
        
        while current_date <= end_date_obj:
            # Doanh thu từ orders
            day_orders = orders_query.filter(
                order_date__date=current_date
            )
            order_revenue = day_orders.aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            # Số lượng đơn hàng
            order_count = day_orders.count()
            
            # Số lượng sản phẩm bán ra
            sold_products = OrderDetail.objects.filter(
                order__in=day_orders,
                is_deleted=False
            ).aggregate(
                total_quantity=Sum('quantity')
            )['total_quantity'] or 0
            
            # Phân tích theo loại sản phẩm
            product_breakdown = OrderDetail.objects.filter(
                order__in=day_orders,
                is_deleted=False
            ).values(
                'product_variant__product__category__name'
            ).annotate(
                quantity=Sum('quantity'),
                revenue=Sum('final_price')
            )
            
            # Phân tích theo cửa hàng
            store_breakdown = day_orders.values(
                'store__name'
            ).annotate(
                revenue=Sum('total_amount'),
                order_count=Count('id')
            )
            
            daily_breakdown.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'order_revenue': float(order_revenue),
                'order_count': order_count,
                'sold_products': sold_products,
                'product_breakdown': list(product_breakdown),
                'store_breakdown': list(store_breakdown)
            })
            
            current_date += timedelta(days=1)
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'daily_breakdown': daily_breakdown
        }) 