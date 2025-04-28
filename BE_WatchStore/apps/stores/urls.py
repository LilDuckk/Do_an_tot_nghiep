from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StockTransferViewSet, StockTransferDetailViewSet,
    StockTakeViewSet, StockTakeDetailViewSet
)

router = DefaultRouter()
router.register(r'stock-transfers', StockTransferViewSet)
router.register(r'stock-transfer-details', StockTransferDetailViewSet)
router.register(r'stock-takes', StockTakeViewSet)
router.register(r'stock-take-details', StockTakeDetailViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
