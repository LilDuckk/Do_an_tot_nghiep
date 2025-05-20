from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views.category_view import CategoryViewSet
from apps.products.views.brand_view import BrandViewSet
from apps.products.views.product_view import (
    ProductViewSet, ProductVariantViewSet
)
from apps.products.views.attribute_view import (
    AttributeTypeViewSet, AttributeValueViewSet,
    AttributeValuePriceAdjustmentViewSet
)
from apps.products.views.product_image_view import ProductImageViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'products', ProductViewSet)
router.register(r'variants', ProductVariantViewSet)
router.register(r'attribute-types', AttributeTypeViewSet)
router.register(r'attribute-values', AttributeValueViewSet)
router.register(r'attribute-price-adjustments', AttributeValuePriceAdjustmentViewSet)
router.register(r'product-images', ProductImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
