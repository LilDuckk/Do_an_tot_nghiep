import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Empty, Table } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl, useImages } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons, ImageManager } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

// Component riêng cho cột ảnh để có thể gọi hook
const ProductImageColumn = ({ record, editingId, onRefresh }) => {
  const imageHandlers = useImages(
    record.id,
    PRODUCT_ENDPOINTS.PRODUCT_UPLOAD_IMAGES ? PRODUCT_ENDPOINTS.PRODUCT_UPLOAD_IMAGES(record.id) : null,
    PRODUCT_ENDPOINTS.PRODUCT_DELETE_IMAGE ? PRODUCT_ENDPOINTS.PRODUCT_DELETE_IMAGE(record.id) : null,
    PRODUCT_ENDPOINTS.PRODUCT_IMAGE_DETAIL,
    onRefresh
  );

  return (
    <ImageManager
      images={record.images || []}
      entityId={record.id}
      isEditing={editingId === record.id}
      uploadingImages={imageHandlers.uploadingImages}
      onImageUpload={imageHandlers.handleImageUpload}
      onDeleteImage={imageHandlers.handleDeleteImage}
      onUpdateAltText={imageHandlers.handleUpdateImageAltText}
      title="Quản lý ảnh sản phẩm"
      entityName="sản phẩm"
      imageSize={{ width: 60, height: 60 }}
      popupImageSize={{ width: 120, height: 120 }}
      columnWidth={120}
    />
  );
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách products
  const {
    data: products,
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
    fetchData: fetchProducts
  } = useListData({
    module: 'product',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.PRODUCTS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.PRODUCTS,
    entityName: 'sản phẩm',
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchProducts();
    }
  }, [deleteData, fetchProducts]);

  const handleView = useCallback((record) => {
    navigate(`/admin/products/${record.id}`);
  }, [navigate]);

  const handleEdit = useCallback((record) => {
    navigate(`/admin/products/${record.id}/edit`);
  }, [navigate]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff' }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            SKU: {record.sku || '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description) => (
        <div style={{ fontSize: '12px' }}>
          {description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : '-'}
        </div>
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand_detail',
      key: 'brand',
      width: 120,
      render: (brandDetail, record) => (
        <span style={{ fontWeight: 500 }}>
          {brandDetail?.name || record.brand || '-'}
        </span>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_detail',
      key: 'category',
      width: 120,
      render: (categoryDetail, record) => (
        <span style={{ fontWeight: 500 }}>
          {categoryDetail?.name || record.category || '-'}
        </span>
      ),
    },
    {
      title: 'SLUG',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug) => (
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {slug || '-'}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <span style={{ 
          color: isActive ? '#52c41a' : '#ff4d4f',
          fontWeight: 500 
        }}>
          {isActive ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      title: 'Ảnh',
      key: 'images',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <ProductImageColumn 
          record={record} 
          editingId={editingId} 
          onRefresh={fetchProducts}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onView={() => handleView(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          hasAccess={hasAccess}
          showView={true}
          showEdit={checkModulePermission('product', 'edit')}
          showDelete={checkModulePermission('product', 'delete')}
          entityName="sản phẩm"
        />
      ),
    },
  ];

  return (
    <div className="admin-products-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="product"
        action="view"
        showUserInfo={true}
      />

      <div className="admin-list-header">
        <h2>Quản lý sản phẩm</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('product', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/products/create')}
            >
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={isLoading}
        rowKey="id"
        className="products-table"
        scroll={{ x: 1400 }}
        pagination={false}
        locale={{
          emptyText: (
            <Empty 
              description="Không có dữ liệu" 
              imageStyle={{ height: 60 }} 
            />
          )
        }}
      />

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
}
