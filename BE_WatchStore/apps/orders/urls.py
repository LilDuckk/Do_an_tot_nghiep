from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.orders.views.order_view import OrderViewSet
from apps.orders.views.order_detail_view import OrderDetailViewSet
from apps.orders.views.return_order_view import ReturnOrderViewSet
from apps.orders.views.return_order_detail_view import ReturnOrderDetailViewSet
from apps.orders.views.coupon_view import CouponViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'order-details', OrderDetailViewSet)
router.register(r'return-orders', ReturnOrderViewSet)
router.register(r'return-order-details', ReturnOrderDetailViewSet)
router.register(r'coupons', CouponViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
