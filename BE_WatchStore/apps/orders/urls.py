from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.orders.views.order_view import OrderViewSet
from apps.orders.views.order_detail_view import OrderDetailViewSet
from apps.orders.views.return_order_view import ReturnOrderViewSet
from apps.orders.views.return_order_detail_view import ReturnOrderDetailViewSet
from apps.orders.views.coupon_view import CouponViewSet
from apps.orders.views.customer_view import CustomerViewSet
from apps.orders.views.complete_order_view import create_complete_order
from apps.orders.views.unassigned_orders_view import get_unassigned_orders, assign_order_to_store, get_my_store_orders

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'order-details', OrderDetailViewSet)
router.register(r'return-orders', ReturnOrderViewSet)
router.register(r'return-order-details', ReturnOrderDetailViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'customers', CustomerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Thêm URL pattern thủ công cho statistics
    path('return-orders/statistics/', ReturnOrderViewSet.as_view({'get': 'statistics'}), name='return-order-statistics'),
    # API tạo đơn hàng hoàn chỉnh
    path('create-complete-order/', create_complete_order, name='create-complete-order'),
    # API quản lý đơn hàng chưa gán cửa hàng
    path('unassigned-orders/', get_unassigned_orders, name='get-unassigned-orders'),
    path('assign-order/<int:order_id>/', assign_order_to_store, name='assign-order-to-store'),
    path('my-store-orders/', get_my_store_orders, name='get-my-store-orders'),
]
