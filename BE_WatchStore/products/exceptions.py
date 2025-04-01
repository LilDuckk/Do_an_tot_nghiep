from rest_framework.exceptions import APIException
from rest_framework import status

class InsufficientStockError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Số lượng sản phẩm trong kho không đủ'
    default_code = 'insufficient_stock'

class InvalidOrderStatusError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Trạng thái đơn hàng không hợp lệ'
    default_code = 'invalid_order_status'

class DuplicateEntryError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Dữ liệu đã tồn tại'
    default_code = 'duplicate_entry'

class ResourceNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Không tìm thấy tài nguyên'
    default_code = 'resource_not_found'

class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Dữ liệu không hợp lệ'
    default_code = 'validation_error'

class PermissionDeniedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Không có quyền thực hiện thao tác này'
    default_code = 'permission_denied'

class AuthenticationError(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Xác thực thất bại'
    default_code = 'authentication_failed'

class DatabaseError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Lỗi cơ sở dữ liệu'
    default_code = 'database_error'

class ExternalServiceError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Lỗi dịch vụ bên ngoài'
    default_code = 'external_service_error' 