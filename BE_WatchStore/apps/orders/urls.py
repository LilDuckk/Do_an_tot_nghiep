from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.views import OrderViewSet, OrderDetailViewSet, OrderCouponViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-details', OrderDetailViewSet, basename='order-detail')
router.register(r'order-coupons', OrderCouponViewSet, basename='order-coupon')

urlpatterns = [
    path('', include(router.urls)),
]
