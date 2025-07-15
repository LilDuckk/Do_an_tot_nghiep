from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory.views.inventory_view import InventoryViewSet
from apps.inventory.views.inventory_transaction_view import InventoryTransactionViewSet
from apps.inventory.views.stock_take_view import StockTakeViewSet
from apps.inventory.views.stock_transfer_view import StockTransferViewSet
from apps.inventory.views.stock_transfer_detail_view import StockTransferDetailViewSet

router = DefaultRouter()
router.register(r'inventories', InventoryViewSet)
router.register(r'inventory-transactions', InventoryTransactionViewSet)
router.register(r'stock-takes', StockTakeViewSet)
router.register(r'stock-transfers', StockTransferViewSet)
router.register(r'stock-transfer-details', StockTransferDetailViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
