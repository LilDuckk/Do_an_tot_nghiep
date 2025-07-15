from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.purchases.views import (
    PurchaseOrderViewSet,
    PurchaseOrderDetailViewSet,
    GoodsReceiptViewSet,
    GoodsReceiptDetailViewSet
)

router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'purchase-order-details', PurchaseOrderDetailViewSet, basename='purchase-order-detail')
router.register(r'goods-receipts', GoodsReceiptViewSet, basename='goods-receipt')
router.register(r'goods-receipt-details', GoodsReceiptDetailViewSet, basename='goods-receipt-detail')

urlpatterns = [
    path('', include(router.urls)),
] 