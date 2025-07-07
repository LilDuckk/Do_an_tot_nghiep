from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.orders.serializers.complete_order_serializer import CompleteOrderSerializer
from apps.orders.serializers.customer_serializer import CustomerSerializer
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from django.db import transaction
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_complete_order(request):
    """
    Tạo đơn hàng hoàn chỉnh bao gồm customer, order và order details
    """
    try:
        with transaction.atomic():
            # Validate input data
            serializer = CompleteOrderSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'message': 'Dữ liệu không hợp lệ',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create customer, order and order details
            result = serializer.save()
            customer = result['customer']
            order = result['order']
            order_details = result['order_details']
            
            # Lưu ý: Không cập nhật inventory ở đây
            # Inventory sẽ được cập nhật khi nhân viên thay đổi trạng thái đơn hàng
            # thông qua services.py
            
            # Prepare response data
            response_data = {
                'success': True,
                'message': 'Tạo đơn hàng thành công',
                'data': {
                    'customer': CustomerSerializer(customer).data,
                    'order': OrderSerializer(order).data,
                    'order_details': OrderDetailSerializer(order_details, many=True).data
                }
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Lỗi khi tạo đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 