from django.contrib import admin
from .models import Inventory, InventoryTransaction

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'location', 'last_updated')
    list_filter = ('location', 'last_updated')
    search_fields = ('product__name', 'product__sku')
    readonly_fields = ('last_updated', 'created_at')

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('inventory', 'transaction_type', 'quantity', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('inventory__product__name', 'reference')
    readonly_fields = ('created_at',) 