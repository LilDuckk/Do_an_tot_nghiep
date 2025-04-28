from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views.daily_revenue_view import DailyRevenueViewSet
from apps.reports.views.top_products_view import TopProductViewSet

router = DefaultRouter()
router.register(r'daily-revenue', DailyRevenueViewSet, basename='daily-revenue')
router.register(r'top-products', TopProductViewSet, basename='top-products')

urlpatterns = [
    path('', include(router.urls)),
]
