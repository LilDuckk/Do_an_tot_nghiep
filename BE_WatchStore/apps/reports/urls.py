from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views.revenue_report_view import RevenueReportViewSet
from apps.reports.views.sales_analysis_view import SalesAnalysisViewSet
from apps.reports.views.dashboard_view import DashboardViewSet

router = DefaultRouter()
router.register(r'revenue', RevenueReportViewSet, basename='revenue')
router.register(r'sales', SalesAnalysisViewSet, basename='sales')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
