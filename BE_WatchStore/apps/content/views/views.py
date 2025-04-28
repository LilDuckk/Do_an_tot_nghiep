from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models import (
    NewsCategory, News, Banner, 
    FooterCategory, FooterLink, AuditLog
)
from ..serializers import (
    NewsCategorySerializer, NewsSerializer,
    BannerSerializer, FooterCategorySerializer,
    FooterLinkSerializer, AuditLogSerializer
)

class NewsCategoryViewSet(viewsets.ModelViewSet):
    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'slug', 'description']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_published']
    search_fields = ['title', 'slug', 'content', 'summary']
    ordering_fields = ['publish_date', 'view_count', 'created_at']
    ordering = ['-publish_date']

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'banner_location']
    search_fields = ['title', 'alt_text']
    ordering_fields = ['display_order', 'start_date', 'end_date']
    ordering = ['display_order']

class FooterCategoryViewSet(viewsets.ModelViewSet):
    queryset = FooterCategory.objects.all()
    serializer_class = FooterCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.all()
    serializer_class = FooterLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'url']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['table_name', 'action', 'user']
    search_fields = ['table_name', 'ip_address']
    ordering_fields = ['action_date']
    ordering = ['-action_date'] 