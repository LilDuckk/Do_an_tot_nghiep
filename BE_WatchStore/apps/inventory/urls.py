from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    path('', views.InventoryListCreateView.as_view(), name='inventory-list-create'),
    path('<int:pk>/', views.InventoryRetrieveUpdateDestroyView.as_view(), name='inventory-detail'),
    path('transactions/', views.InventoryTransactionListCreateView.as_view(), name='inventory-transaction-list-create'),
    path('transactions/<int:pk>/', views.InventoryTransactionRetrieveUpdateDestroyView.as_view(), name='inventory-transaction-detail'),
]
