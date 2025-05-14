from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.warranty.views.warranty_view import WarrantyViewSet
from apps.warranty.views.warranty_claim_view import WarrantyClaimViewSet

router = DefaultRouter()
router.register(r'warranties', WarrantyViewSet, basename='warranty')
router.register(r'claims', WarrantyClaimViewSet, basename='warranty-claim')

urlpatterns = [
    path('', include(router.urls)),
]
