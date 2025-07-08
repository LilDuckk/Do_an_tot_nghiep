# Quản lý thông tin người dùng

## Tổng quan

Hệ thống đã được cập nhật để tự động lấy và sử dụng thông tin cửa hàng và nhân viên của người đăng nhập trong các trang quản lý đơn đặt hàng và phiếu nhập kho.

## Cách hoạt động

### 1. Lưu trữ thông tin user (AdminLogin.js)

Khi người dùng đăng nhập, thông tin được lưu vào localStorage với cấu trúc:

```javascript
localStorage.setItem('adminUser', JSON.stringify({
  ...user,
  employee_id: employeeId,  // ID của nhân viên
  store_id: storeId         // ID của cửa hàng
}));
```

### 2. Utility functions (src/services/userInfo.js)

Các hàm tiện ích để lấy thông tin user:

```javascript
import { getUserInfo, debugUserInfo } from '../../services/userInfo';

// Lấy tất cả thông tin user
const { currentUser, isSuperUser, currentEmployeeId, currentStoreId } = getUserInfo();

// Debug thông tin user
debugUserInfo();
```

### 3. Tự động điền thông tin

#### Trong PurchaseOrdersPage.js:
- Khi tạo đơn đặt hàng mới, nếu không phải superuser:
  - Tự động điền `store_id` và `employee_id` của người đăng nhập
  - Disable field cửa hàng và nhân viên
  - Tự động lọc danh sách nhân viên theo cửa hàng

#### Trong GoodsReceiptsPage.js:
- Khi tạo phiếu nhập kho mới, nếu không phải superuser:
  - Tự động điền `employee_id` của người đăng nhập
  - Disable field nhân viên
  - Tự động lọc danh sách nhân viên theo cửa hàng

## Các thay đổi chính

### 1. PurchaseOrdersPage.js
- ✅ Thêm helper function để lấy thông tin user
- ✅ Tự động điền store_id và employee_id khi tạo mới
- ✅ Disable fields cho non-superuser
- ✅ Tự động lọc nhân viên theo cửa hàng
- ✅ Debug logs để kiểm tra thông tin

### 2. GoodsReceiptsPage.js
- ✅ Thêm helper function để lấy thông tin user
- ✅ Tự động điền employee_id khi tạo mới
- ✅ Disable field nhân viên cho non-superuser
- ✅ Tự động lọc nhân viên theo cửa hàng
- ✅ Debug logs để kiểm tra thông tin

### 3. userInfo.js (Utility)
- ✅ Tạo file utility để quản lý thông tin user
- ✅ Các hàm tiện ích để lấy thông tin
- ✅ Hàm debug để kiểm tra

## Cách sử dụng

### Cho Superuser:
- Có thể chọn bất kỳ cửa hàng và nhân viên nào
- Tất cả fields đều có thể chỉnh sửa

### Cho Non-Superuser:
- Tự động được gán cửa hàng và nhân viên của họ
- Không thể thay đổi thông tin cửa hàng và nhân viên
- Chỉ thấy nhân viên trong cửa hàng của họ

## Debug

Để kiểm tra thông tin user, mở Developer Console và xem logs:

```javascript
// Trong console sẽ hiển thị:
Debug User Info: {
  currentUser: {...},
  isSuperUser: false,
  currentEmployeeId: 123,
  currentStoreId: 456
}
```

## Lưu ý

1. Thông tin user được lưu trong localStorage nên sẽ mất khi logout
2. Cần đảm bảo API trả về đúng cấu trúc dữ liệu user với `employee_id` và `store_id`
3. Superuser vẫn có thể chỉnh sửa tất cả thông tin
4. Non-superuser bị giới hạn theo cửa hàng và nhân viên của họ 