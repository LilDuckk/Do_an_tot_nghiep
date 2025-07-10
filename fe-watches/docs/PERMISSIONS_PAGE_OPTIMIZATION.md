# Tối ưu hóa PermissionsListPage

## Tổng quan
Đã cập nhật trang `PermissionsListPage.js` và các hook/component liên quan để sử dụng các hook có sẵn, tối ưu hóa code và sửa lỗi API.

## Các thay đổi chính

### 1. Cập nhật usePagination.js
- **Thêm function `parseApiResponse`**: Tự động parse cấu trúc API response `{count, results, next, previous}`
- **Thêm state `hasNext`, `hasPrevious`**: Dựa trên API response để kiểm tra có trang tiếp theo/trước không
- **Cập nhật `canGoPrevious`, `canGoNext`**: Sử dụng cả logic trang và API response
- **Cải thiện `renderPagination`**: Hỗ trợ callback tùy chỉnh cho page change

### 2. Cập nhật CustomPagination.js
- **Thêm props `hasNext`, `hasPrevious`**: Để kiểm tra chính xác khả năng chuyển trang
- **Cải thiện logic disable buttons**: Dựa trên cả trang hiện tại và API response
- **Tối ưu hiển thị**: Chỉ hiển thị các nút có thể sử dụng

### 3. Tạo useListData.js (Hook mới)
- **Hook tích hợp**: Kết hợp `useAccessControl`, `useApiCall`, `useSearchAndFilter`, `usePagination`
- **Tự động fetch data**: Khi dependencies thay đổi
- **Xử lý lỗi tích hợp**: Bao gồm access control và API errors
- **API**: 
  ```javascript
  const {
    data, isLoading, hasAccess,
    searchText, setSearchText,
    currentPage, setCurrentPage,
    totalPages, total, hasNext, hasPrevious,
    fetchData, refreshData, clearSearch
  } = useListData({
    module: 'permission',
    action: 'view',
    apiEndpoint: AUTH_ENDPOINTS.PERMISSIONS,
    pageSize: 20,
    debounceDelay: 500
  });
  ```

### 4. Cập nhật PermissionsListPage.js
- **Sử dụng `useListData`**: Thay thế 4 hook riêng lẻ bằng 1 hook tích hợp
- **Code ngắn gọn**: Giảm từ ~150 dòng xuống ~80 dòng
- **Sử dụng `CustomPagination`**: Thay vì render pagination thủ công
- **Import tối ưu**: Sử dụng centralized exports

## Cấu trúc API Response được hỗ trợ
```json
{
  "count": 36,
  "results": [...],
  "next": "http://localhost:8000/api/stores/stores/?page=2&page_size=20",
  "previous": null
}
```

## Lợi ích

### 1. Code sạch hơn
- Giảm boilerplate code
- Tách biệt logic nghiệp vụ và UI
- Dễ bảo trì và mở rộng

### 2. Tái sử dụng cao
- `useListData` có thể dùng cho tất cả trang danh sách
- `CustomPagination` component có thể dùng ở mọi nơi
- Hook `usePagination` đã được cải thiện

### 3. Xử lý lỗi tốt hơn
- Tự động kiểm tra quyền truy cập
- Xử lý API errors một cách nhất quán
- Hiển thị thông báo lỗi phù hợp

### 4. Performance tốt hơn
- Debounce search tự động
- Chỉ fetch data khi cần thiết
- Memoization cho các function

## Cách sử dụng cho các trang khác

### Sử dụng useListData
```javascript
const {
  data, isLoading, hasAccess,
  searchText, setSearchText,
  currentPage, setCurrentPage,
  totalPages, total, hasNext, hasPrevious
} = useListData({
  module: 'user', // hoặc 'product', 'order', etc.
  action: 'view',
  apiEndpoint: USER_ENDPOINTS.USERS,
  pageSize: 20
});
```

### Sử dụng CustomPagination
```javascript
<CustomPagination
  currentPage={currentPage}
  totalPages={totalPages}
  total={total}
  onPageChange={setCurrentPage}
  hasAccess={hasAccess}
  hasNext={hasNext}
  hasPrevious={hasPrevious}
/>
```

## Files đã cập nhật
1. `src/admin/hooks/usePagination.js` - Cải thiện hook pagination
2. `src/admin/components/common/CustomPagination.js` - Cập nhật component pagination
3. `src/admin/hooks/useListData.js` - Hook mới tích hợp
4. `src/admin/hooks/index.js` - Export hook mới
5. `src/admin/pages/permissions/PermissionsListPage.js` - Sử dụng hook mới

## Kết luận
Việc tối ưu hóa này giúp code ngắn gọn hơn, dễ bảo trì hơn và có thể tái sử dụng cho các trang danh sách khác trong hệ thống. 