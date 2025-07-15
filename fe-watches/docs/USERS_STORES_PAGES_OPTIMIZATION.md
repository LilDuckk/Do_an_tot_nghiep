# Tối ưu hóa UsersListPage và StoresPage

## Tổng quan
Đã cập nhật cả hai trang `UsersListPage.js` và `StoresPage.js` để sử dụng hook `useListData` và các component đã được tối ưu hóa, tương tự như `PermissionsListPage.js`.

## Các thay đổi chính

### 1. UsersListPage.js

#### Trước khi tối ưu:
- Sử dụng 4 hook riêng lẻ: `useAccessControl`, `usePagination`, `useApiCall`, `useSearchAndFilter`
- Code dài ~500 dòng với nhiều logic lặp lại
- Xử lý fetch data thủ công
- Pagination render thủ công

#### Sau khi tối ưu:
- Sử dụng 1 hook tích hợp: `useListData`
- Code ngắn gọn ~400 dòng
- Tự động fetch data và xử lý pagination
- Sử dụng `CustomPagination` component

#### Thay đổi cụ thể:
```javascript
// Trước
const { hasAccess, checkModulePermission, getModuleAccess } = useAccessControl('user', 'view');
const { currentPage, totalPages, setCurrentPage, setTotalPages } = usePagination(ITEMS_PER_PAGE);
const { searchText, setSearchText, debouncedSearchText } = useSearchAndFilter();
const { loading, get } = useApiCall();

// Sau
const {
  data: users,
  isLoading,
  hasAccess,
  searchText,
  setSearchText,
  currentPage,
  setCurrentPage,
  totalPages,
  total,
  hasNext,
  hasPrevious,
  fetchData: fetchUsers
} = useListData({
  module: 'user',
  action: 'view',
  apiEndpoint: USER_ENDPOINTS.USERS,
  pageSize: 20,
  debounceDelay: 500
});
```

### 2. StoresPage.js

#### Trước khi tối ưu:
- Sử dụng 4 hook riêng lẻ
- Code dài ~339 dòng
- Logic fetch data phức tạp với nhiều useEffect
- Xử lý employee count riêng biệt

#### Sau khi tối ưu:
- Sử dụng `useListData` cho stores data
- Code ngắn gọn ~300 dòng
- Tách biệt logic fetch employee count
- Sử dụng `CustomPagination` component

#### Thay đổi cụ thể:
```javascript
// Trước
const { hasAccess, checkModulePermission } = useAccessControl('store', 'view');
const { currentPage, totalPages, setCurrentPage, setTotalPages } = usePagination(ITEMS_PER_PAGE);
const { searchText, setSearchText, debouncedSearchText } = useSearchAndFilter();
const { loading, get } = useApiCall();

// Sau
const {
  data: stores,
  isLoading,
  hasAccess,
  searchText,
  setSearchText,
  currentPage,
  setCurrentPage,
  totalPages,
  total,
  hasNext,
  hasPrevious,
  fetchData: fetchStores
} = useListData({
  module: 'store',
  action: 'view',
  apiEndpoint: STORE_ENDPOINTS.STORES,
  pageSize: 20,
  debounceDelay: 500
});
```

## Cải tiến chung

### 1. Sử dụng useListData hook
- **Tích hợp 4 hook**: `useAccessControl`, `useApiCall`, `useSearchAndFilter`, `usePagination`
- **Tự động fetch data**: Khi dependencies thay đổi
- **Xử lý lỗi tích hợp**: Bao gồm access control và API errors
- **API nhất quán**: Cho tất cả trang danh sách

### 2. Sử dụng CustomPagination component
- **Props đầy đủ**: `hasNext`, `hasPrevious` từ API response
- **Logic chính xác**: Dựa trên cả trang hiện tại và API response
- **UI nhất quán**: Cho tất cả trang

### 3. Tối ưu hóa imports
- **Centralized exports**: Sử dụng `@/admin/hooks` và `@/admin/components`
- **Giảm imports**: Từ nhiều hook xuống 1-2 hook chính
- **Dễ bảo trì**: Khi thay đổi cấu trúc

### 4. Xử lý API calls
- **Tách biệt logic**: Stores page tách riêng fetch employee count
- **Error handling**: Try-catch cho các API calls bổ sung
- **Performance**: Chỉ fetch khi cần thiết

## Lợi ích

### 1. Code sạch hơn
- **Giảm boilerplate**: Từ ~500 dòng xuống ~400 dòng (UsersListPage)
- **Logic rõ ràng**: Tách biệt data fetching và UI rendering
- **Dễ đọc**: Code ngắn gọn, dễ hiểu

### 2. Tái sử dụng cao
- **useListData**: Có thể dùng cho tất cả trang danh sách
- **CustomPagination**: Component chung cho pagination
- **Pattern nhất quán**: Cho toàn bộ admin system

### 3. Performance tốt hơn
- **Debounce search**: Tự động từ useListData
- **Memoization**: Các function được memoize
- **Selective fetching**: Chỉ fetch data khi cần

### 4. Maintainability
- **Dễ bảo trì**: Logic tập trung trong hooks
- **Dễ mở rộng**: Thêm tính năng mới dễ dàng
- **Dễ test**: Tách biệt logic và UI

## Cách sử dụng cho các trang khác

### Template cho trang danh sách mới:
```javascript
import { useListData, useCRUD } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination } from '@/admin/components';

const NewListPage = () => {
  const {
    data,
    isLoading,
    hasAccess,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    hasNext,
    hasPrevious,
    fetchData
  } = useListData({
    module: 'module_name',
    action: 'view',
    apiEndpoint: API_ENDPOINTS.MODULE,
    pageSize: 20
  });

  return (
    <div>
      <AccessDeniedAlert hasAccess={hasAccess} module="module_name" />
      
      {/* Table */}
      <Table dataSource={data} loading={isLoading} />
      
      {/* Pagination */}
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={setCurrentPage}
        hasAccess={hasAccess}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
};
```

## Files đã cập nhật
1. `src/admin/pages/users/UsersListPage.js` - Sử dụng useListData
2. `src/admin/pages/stores/StoresPage.js` - Sử dụng useListData
3. `src/admin/hooks/useListData.js` - Hook tích hợp (đã tạo trước đó)
4. `src/admin/hooks/usePagination.js` - Cải thiện pagination (đã cập nhật trước đó)
5. `src/admin/components/common/CustomPagination.js` - Component pagination (đã cập nhật trước đó)

## Kết luận
Việc tối ưu hóa này giúp:
- **Giảm code duplication**: Logic chung được tập trung trong hooks
- **Tăng consistency**: Tất cả trang danh sách có cùng pattern
- **Cải thiện developer experience**: Dễ viết và bảo trì code
- **Tăng performance**: Tối ưu hóa re-renders và API calls

Các trang danh sách khác trong hệ thống có thể dễ dàng áp dụng pattern này để có được lợi ích tương tự. 