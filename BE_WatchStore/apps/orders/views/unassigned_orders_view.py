from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.orders.models.order import Orders
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.stores.models.employee import Employee
from apps.stores.models.store import Store
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

class UnassignedOrdersPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unassigned_orders(request):
    """
    Lấy danh sách đơn hàng chưa được gán cửa hàng
    """
    try:
        # Lấy các đơn hàng chưa có store (store=None) và chưa bị hủy
        unassigned_orders = Orders.objects.filter(
            store__isnull=True,
            is_deleted=False,
            status__in=['pending', 'processing', 'shipped', 'delivered']
        ).order_by('-created_at')
        
        # Phân trang
        paginator = UnassignedOrdersPagination()
        paginated_orders = paginator.paginate_queryset(unassigned_orders, request)
        
        # Serialize data
        serializer = OrderSerializer(paginated_orders, many=True)
        
        return paginator.get_paginated_response({
            'success': True,
            'message': 'Lấy danh sách đơn hàng chưa gán cửa hàng thành công',
            'data': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Lỗi khi lấy danh sách đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_order_to_store(request, order_id):
    """
    Nhận đơn hàng về cửa hàng của nhân viên đăng nhập
    """
    try:
        # Lấy đơn hàng
        try:
            order = Orders.objects.get(id=order_id, is_deleted=False)
        except Orders.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Đơn hàng không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Kiểm tra đơn hàng đã được gán cửa hàng chưa
        if order.store:
            return Response({
                'success': False,
                'message': 'Đơn hàng này đã được gán cho cửa hàng khác'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Lấy thông tin nhân viên từ user đăng nhập
        try:
            employee = Employee.objects.get(
                user=request.user,
                is_deleted=False
            )
        except Employee.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Tài khoản này không phải là nhân viên'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Kiểm tra nhân viên có cửa hàng không
        if not employee.store:
            return Response({
                'success': False,
                'message': 'Nhân viên này chưa được gán cho cửa hàng nào'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Gán đơn hàng cho cửa hàng của nhân viên
        order.store = employee.store
        order.employee = employee
        order.updated_by = request.user
        order.save()
        
        # Serialize response
        serializer = OrderSerializer(order)
        
        return Response({
            'success': True,
            'message': f'Đã nhận đơn hàng #{order.id} về cửa hàng {employee.store.name}',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Lỗi khi nhận đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_store_orders(request):
    """
    Lấy danh sách đơn hàng của cửa hàng mà nhân viên đang làm việc
    """
    try:
        # Lấy thông tin nhân viên từ user đăng nhập
        try:
            employee = Employee.objects.get(
                user=request.user,
                is_deleted=False
            )
        except Employee.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Tài khoản này không phải là nhân viên'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Kiểm tra nhân viên có cửa hàng không
        if not employee.store:
            return Response({
                'success': False,
                'message': 'Nhân viên này chưa được gán cho cửa hàng nào'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Lấy đơn hàng của cửa hàng
        store_orders = Orders.objects.filter(
            store=employee.store,
            is_deleted=False
        ).order_by('-created_at')
        
        # Phân trang
        paginator = UnassignedOrdersPagination()
        paginated_orders = paginator.paginate_queryset(store_orders, request)
        
        # Serialize data
        serializer = OrderSerializer(paginated_orders, many=True)
        
        return paginator.get_paginated_response({
            'success': True,
            'message': f'Lấy danh sách đơn hàng của cửa hàng {employee.store.name} thành công',
            'data': serializer.data,
            'store_info': {
                'store_id': employee.store.id,
                'store_name': employee.store.name,
                'employee_name': employee.name
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Lỗi khi lấy danh sách đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 