from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views.category_view import CategoryViewSet
from apps.products.views.brand_view import BrandViewSet
from apps.products.views.product_view import ProductViewSet
from apps.products.views.variant_view import ProductVariantViewSet, VariantViewSet
from apps.products.views.attribute_view import AttributeValueViewSet, AttributeTypeViewSet
from apps.products.views.product_image_view import ProductImageViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-variants', ProductVariantViewSet)
router.register(r'variants', VariantViewSet)
router.register(r'attributesvalue', AttributeValueViewSet)
router.register(r'attributestype', AttributeTypeViewSet)
router.register(r'product-images', ProductImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
