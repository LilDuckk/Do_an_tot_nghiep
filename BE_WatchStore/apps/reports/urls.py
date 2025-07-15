from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views.dashboard_view import DashboardViewSet
from apps.reports.views.sales_analysis_view import SalesAnalysisViewSet
from apps.reports.views.revenue_report_view import RevenueReportViewSet
from apps.reports.views.return_warranty_report_view import ReturnWarrantyReportViewSet
from apps.reports.views.top_customers_view import TopCustomersView
from apps.reports.views.best_selling_view import BestSellingView
from apps.reports.views.top_products_view import TopProductsView

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'sales', SalesAnalysisViewSet, basename='sales')
router.register(r'revenue', RevenueReportViewSet, basename='revenue')
router.register(r'return-warranty-report', ReturnWarrantyReportViewSet, basename='return-warranty-report')

urlpatterns = [
    path('', include(router.urls)),
    path('top-customers/', TopCustomersView.as_view(), name='top-customers'),
    path('best-selling/', BestSellingView.as_view(), name='best-selling'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    # Thêm route cho daily-revenue APIs
    path('daily-revenue/', include([
        path('daily_summary/', RevenueReportViewSet.as_view({'get': 'daily_summary'}), name='daily-summary'),
        path('daily_breakdown/', RevenueReportViewSet.as_view({'get': 'daily_breakdown'}), name='daily-breakdown'),
        path('calculate_daily_revenue/', RevenueReportViewSet.as_view({'get': 'calculate_daily_revenue'}), name='calculate-daily-revenue'),
        path('inventory_analysis/', RevenueReportViewSet.as_view({'get': 'inventory_analysis'}), name='inventory-analysis'),
        path('revenue_forecast/', RevenueReportViewSet.as_view({'get': 'revenue_forecast'}), name='revenue-forecast'),
        path('top_products/', RevenueReportViewSet.as_view({'get': 'top_products'}), name='daily-revenue-top-products'),
        path('store_performance/', RevenueReportViewSet.as_view({'get': 'store_performance'}), name='store-performance'),
    ])),
]
