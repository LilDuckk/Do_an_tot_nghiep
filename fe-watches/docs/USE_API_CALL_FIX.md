# Sửa lỗi useApiCall.js - Tóm tắt

## 🐛 Vấn đề gặp phải

**Lỗi**: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Nguyên nhân**: Hook `useApiCall.js` đang cố gắng parse tất cả response thành JSON mà không kiểm tra content-type, dẫn đến việc parse HTML error page thành JSON.

## 🔍 Phân tích vấn đề

### 1. **Cách gọi API trong OrdersPage.js (đúng)**
```javascript
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 403) {
  message.error('Bạn không có quyền xem danh sách này.');
  return;
}

const data = await response.json();
```

### 2. **Cách gọi API trong useApiCall.js (sai)**
```javascript
const response = await fetch(url, options);
const data = await response.json(); // ❌ Luôn parse JSON
```

## ✅ Giải pháp đã thực hiện

### 1. **Thêm safeParseResponse function**
```javascript
const safeParseResponse = useCallback(async (response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error parsing response:', error);
    return null;
  }
}, []);
```

### 2. **Cập nhật các HTTP methods**
- **GET**: Kiểm tra status trước khi parse
- **POST**: Kiểm tra status trước khi parse  
- **PUT**: Kiểm tra status trước khi parse
- **DELETE**: Kiểm tra status trước khi parse

### 3. **Thêm loading state**
```javascript
const [loading, setLoading] = useState(false);
```

### 4. **Cải thiện error handling**
```javascript
if (isAccessError(response)) {
  throw new Error('Bạn không có quyền truy cập dữ liệu này.');
}

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
```

## 🔄 Cập nhật StoresPage.js

### 1. **Sử dụng useApiCall đúng cách**
```javascript
// Trước
const { makeApiCall } = useApiCall();

// Sau  
const { get, post, put, del } = useApiCall();
```

### 2. **Cập nhật fetchStores**
```javascript
// Trước
const success = await makeApiCall(async () => {
  const response = await fetch(url, options);
  // handle response...
}, 'Error message');

// Sau
const result = await get(url, params, 'Error message');
if (result.success && result.data) {
  // handle success
}
```

### 3. **Cập nhật useCRUD**
```javascript
// Trước
const { handleCreate, handleUpdate, handleDelete } = useCRUD({
  endpoints: STORE_ENDPOINTS,
  entityName: 'cửa hàng',
  onSuccess: () => { /* callback */ }
});

// Sau
const { handleCreate, handleUpdate, handleDelete } = useCRUD({
  baseUrl: STORE_ENDPOINTS.STORES,
  entityName: 'cửa hàng'
});
```

## 📊 So sánh trước và sau

### Trước khi sửa:
- ❌ Parse tất cả response thành JSON
- ❌ Không kiểm tra content-type
- ❌ Không có loading state
- ❌ Error handling không đầy đủ

### Sau khi sửa:
- ✅ Kiểm tra content-type trước khi parse
- ✅ Kiểm tra HTTP status codes
- ✅ Có loading state
- ✅ Error handling đầy đủ
- ✅ Access control handling

## 🎯 Lợi ích đạt được

### 1. **Stability**
- ✅ Không còn lỗi parse JSON
- ✅ Xử lý lỗi HTTP đúng cách
- ✅ Graceful error handling

### 2. **User Experience**
- ✅ Loading states rõ ràng
- ✅ Error messages chính xác
- ✅ Access control feedback

### 3. **Developer Experience**
- ✅ Code dễ debug
- ✅ Consistent error handling
- ✅ Reusable API patterns

## 🚀 Kết luận

Việc sửa lỗi `useApiCall.js` đã thành công:
- **Loại bỏ lỗi JSON parsing**
- **Cải thiện error handling**
- **Thêm loading states**
- **Tăng tính ổn định của ứng dụng**

Pattern này có thể áp dụng cho tất cả các API calls trong ứng dụng để đảm bảo tính nhất quán và ổn định. 