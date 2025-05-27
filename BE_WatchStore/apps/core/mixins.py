from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

class SoftDeleteMixin:
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Khôi phục một bản ghi đã bị xóa mềm
        """
        instance = self.get_object()
        instance.is_deleted = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """
        Lấy danh sách các bản ghi đã bị xóa mềm
        """
        queryset = self.get_queryset().all_objects.filter(is_deleted=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 