from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .auth import RegisterView

router = DefaultRouter()

# Trang khách hàng
router.register(r'categories', views.ProductCategoryViewSet, basename='category')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'orders', views.OrderViewSet, basename='order')

# Trang quản trị
router.register(r'employees', views.EmployeeViewSet, basename='employee')
router.register(r'stores', views.StoreViewSet, basename='store')
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'stock-in', views.StockInViewSet, basename='stock-in')
router.register(r'stock-out', views.StockOutViewSet, basename='stock-out')
router.register(r'revenue', views.RevenueViewSet, basename='revenue')

# Quản lý thuộc tính sản phẩm
router.register(r'attributes', views.AttributeViewSet, basename='attribute')
router.register(r'category-attributes', views.CategoryAttributeViewSet, basename='category-attribute')
router.register(r'attribute-values', views.AttributeValueViewSet, basename='attribute-value')
router.register(r'product-variants', views.ProductVariantViewSet, basename='product-variant')
router.register(r'product-variant-attributes', views.ProductVariantAttributeViewSet, basename='product-variant-attribute')

# Quản lý vận chuyển và đơn hàng
router.register(r'shipments', views.ShipmentViewSet, basename='shipment')
router.register(r'returns', views.ReturnViewSet, basename='return')
router.register(r'warranty-cards', views.WarrantyCardViewSet, basename='warranty-card')

# Quản lý sản phẩm
router.register(r'product-specifications', views.ProductSpecificationViewSet, basename='product-specification')
router.register(r'product-reviews', views.ProductReviewViewSet, basename='product-review')
router.register(r'product-wishlist', views.ProductWishlistViewSet, basename='product-wishlist')
router.register(r'price-history', views.PriceHistoryViewSet, basename='price-history')

# Quản lý khuyến mãi
router.register(r'coupons', views.CouponViewSet, basename='coupon')

# Quản lý thông báo và lịch sử
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'login-history', views.LoginHistoryViewSet, basename='login-history')

urlpatterns = [
    path('', include(router.urls)),
    # Authentication URLs
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Custom actions
    path('coupons/verify/', views.CouponViewSet.as_view({'post': 'verify'}), name='coupon-verify'),
    path('notifications/<int:pk>/read/', views.NotificationViewSet.as_view({'put': 'mark_as_read'}), name='notification-read'),
] 