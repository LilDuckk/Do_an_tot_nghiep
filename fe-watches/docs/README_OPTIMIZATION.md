# Hướng dẫn sử dụng các tối ưu Admin Panel

## Tổng quan

Dự án đã được tối ưu với các components, hooks và utilities tái sử dụng để cải thiện hiệu suất, giảm code trùng lặp và tăng tính bảo trì.

## Cấu trúc thư mục

```
src/admin/
├── hooks/                 # Custom hooks
│   ├── useApi.js         # Quản lý API calls
│   ├── usePagination.js  # Quản lý phân trang
│   ├── useAccessControl.js # Quản lý quyền truy cập
│   ├── useListData.js    # Quản lý dữ liệu danh sách
│   └── useDebounce.js    # Debounce hook
├── components/           # Components tái sử dụng
│   ├── SearchBar.js      # Component tìm kiếm
│   ├── ActionButtons.js  # Component nút thao tác
│   └── BaseListPage.js   # Component trang danh sách cơ bản
├── contexts/            # React Contexts
│   └── AuthContext.js   # Quản lý authentication
├── utils/               # Utility functions
│   ├── apiUtils.js      # Utilities cho API
│   └── tableUtils.js    # Utilities cho table
├── static/              # CSS files
│   └── AdminComponents.css # CSS cho components
└── index.js             # Export tất cả
```

## Cách sử dụng

### 1. Import các components và hooks

```javascript
import {
  // Hooks
  useApi,
  usePagination,
  useAccessControl,
  useListData,
  useDebounce,
  
  // Components
  SearchBar,
  ActionButtons,
  BaseListPage,
  
  // Contexts
  useAuth,
  
  // Utils
  formatCurrency,
  formatDate,
  renderStatusTag,
  buildQueryParams,
} from '../admin';
```

### 2. Sử dụng BaseListPage cho trang danh sách

```javascript
const MyListPage = () => {
  const { checkPermission } = useAccessControl();
  
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    // ... các cột khác
  ];

  const handleCreate = () => {
    // Logic tạo mới
  };

  const handleEdit = (record) => {
    // Logic sửa
  };

  const handleDelete = (record) => {
    // Logic xóa
  };

  return (
    <BaseListPage
      fetchUrl="/api/items"
      columns={columns}
      searchPlaceholder="Tìm kiếm..."
      showCreate={checkPermission('add_item')}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      requiredPermission="view_item"
      checkPermission={checkPermission}
    />
  );
};
```

### 3. Sử dụng useListData hook

```javascript
const MyComponent = () => {
  const {
    data,
    loading,
    searchText,
    setSearchText,
    currentPage,
    totalPages,
    fetchData,
    refreshData,
    clearFilters,
  } = useListData('/api/items', {
    itemsPerPage: 20,
    searchDelay: 500,
    transformData: (data) => data.map(item => ({
      ...item,
      key: item.id,
    })),
  });

  // Sử dụng các state và functions
};
```

### 4. Sử dụng useApi hook

```javascript
const MyComponent = () => {
  const { apiCall, loading, error } = useApi();

  const fetchData = async () => {
    try {
      const data = await apiCall('/api/items');
      // Xử lý data
    } catch (error) {
      // Error đã được handle tự động
    }
  };

  const createItem = async (itemData) => {
    try {
      await apiCall('/api/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      message.success('Tạo thành công');
    } catch (error) {
      // Error đã được handle tự động
    }
  };
};
```

### 5. Sử dụng AuthContext

```javascript
const MyComponent = () => {
  const { 
    user, 
    permissions, 
    isSuperUser, 
    checkPermission,
    login, 
    logout 
  } = useAuth();

  const canEdit = checkPermission('change_item');
  
  if (!canEdit) {
    return <div>Không có quyền</div>;
  }
};
```

### 6. Sử dụng utility functions

```javascript
import { formatCurrency, formatDate, renderStatusTag } from '../admin';

// Format tiền tệ
const price = formatCurrency(1000000); // "1.000.000 ₫"

// Format ngày
const date = formatDate('2024-01-01'); // "01/01/2024 00:00:00"

// Render status tag
const status = renderStatusTag('active', {
  active: { color: 'green', text: 'Hoạt động' },
  inactive: { color: 'red', text: 'Không hoạt động' },
});
```

## Lợi ích của việc tối ưu

### 1. Giảm code trùng lặp
- Các logic chung được tách ra thành hooks và components
- Không cần viết lại code phân trang, tìm kiếm, xử lý lỗi

### 2. Cải thiện hiệu suất
- Sử dụng React.memo và useMemo để tránh re-render không cần thiết
- Debounce search để giảm số lượng API calls
- Lazy loading và code splitting

### 3. Dễ bảo trì
- Code được tổ chức theo module
- Dễ dàng thay đổi logic chung mà không ảnh hưởng đến các trang khác
- Consistent UI/UX across all pages

### 4. Tăng tính tái sử dụng
- Components có thể được sử dụng ở nhiều nơi
- Hooks có thể được kết hợp với nhau
- Utils có thể được sử dụng ở bất kỳ đâu

## Migration Guide

### Từ trang cũ sang trang mới

1. **Thay thế state management:**
```javascript
// Cũ
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);

// Mới
const { data, loading, currentPage, setCurrentPage } = useListData('/api/items');
```

2. **Thay thế API calls:**
```javascript
// Cũ
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/items');
    const data = await response.json();
    setData(data);
  } catch (error) {
    message.error('Lỗi');
  } finally {
    setLoading(false);
  }
};

// Mới
const { apiCall } = useApi();
const fetchData = async () => {
  try {
    const data = await apiCall('/api/items');
    // data đã được set tự động
  } catch (error) {
    // Error đã được handle tự động
  }
};
```

3. **Thay thế table:**
```javascript
// Cũ
<Table
  columns={columns}
  dataSource={data}
  loading={loading}
  pagination={{
    current: currentPage,
    total: total,
    onChange: handlePageChange,
  }}
/>

// Mới
<BaseListPage
  fetchUrl="/api/items"
  columns={columns}
  // Pagination được handle tự động
/>
```

## Best Practices

1. **Luôn sử dụng useCallback cho event handlers**
2. **Sử dụng useMemo cho expensive calculations**
3. **Tách logic phức tạp thành custom hooks**
4. **Sử dụng TypeScript để type safety**
5. **Test các components và hooks riêng biệt**
6. **Document các props và API của components**

## Troubleshooting

### Lỗi thường gặp

1. **Import không đúng:**
```javascript
// Sai
import { useApi } from './hooks/useApi';

// Đúng
import { useApi } from '../admin';
```

2. **Không wrap component với AuthProvider:**
```javascript
// Cần wrap trong AdminLayout hoặc AuthProvider
<AuthProvider>
  <MyComponent />
</AuthProvider>
```

3. **Quên check permission:**
```javascript
// Luôn check permission trước khi render
const canAccess = checkPermission('view_item');
if (!canAccess) return <AccessDenied />;
```

## Performance Tips

1. **Sử dụng React.memo cho components con**
2. **Tách state local và global**
3. **Sử dụng useCallback cho functions**
4. **Sử dụng useMemo cho expensive calculations**
5. **Lazy load components không cần thiết**
6. **Optimize bundle size với tree shaking** 