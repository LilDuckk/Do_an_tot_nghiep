from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views.dashboard_view import DashboardViewSet
from apps.reports.views.sales_analysis_view import SalesAnalysisViewSet
from apps.reports.views.revenue_report_view import RevenueReportViewSet
from apps.reports.views.return_warranty_report_view import ReturnWarrantyReportViewSet
from apps.reports.views.daily_revenue_view import DailyRevenueViewSet
from apps.reports.views.top_products_view import TopProductViewSet
from apps.reports.views.top_customers_view import TopCustomersView
from apps.reports.views.best_selling_view import BestSellingView

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'sales', SalesAnalysisViewSet, basename='sales')
router.register(r'revenue', RevenueReportViewSet, basename='revenue')
router.register(r'return-warranty-report', ReturnWarrantyReportViewSet, basename='return-warranty-report')
router.register(r'daily-revenue', DailyRevenueViewSet, basename='daily-revenue')
router.register(r'top-products', TopProductViewSet, basename='top-products')

urlpatterns = [
    path('', include(router.urls)),
    path('top-customers/', TopCustomersView.as_view(), name='top-customers'),
    path('best-selling/', BestSellingView.as_view(), name='best-selling'),
]
