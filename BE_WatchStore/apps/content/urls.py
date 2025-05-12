from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.content.views.banner_view import BannerViewSet
from apps.content.views.news_view import NewsViewSet
from apps.content.views.footer_view import FooterCategoryViewSet, FooterLinkViewSet
from apps.content.views.contact_info_view import ContactInfoViewSet

router = DefaultRouter()
router.register(r'banners', BannerViewSet)
router.register(r'news', NewsViewSet)
router.register(r'footer-categories', FooterCategoryViewSet, basename='footer-category')
router.register(r'footer-links', FooterLinkViewSet, basename='footer-link')
router.register(r'contact-infos', ContactInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
