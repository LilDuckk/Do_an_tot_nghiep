import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Empty, Table, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl, useImages } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons, ImageManager } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

// Component riêng cho cột ảnh để có thể gọi hook
const VariantImageColumn = ({ record, editingId, onRefresh }) => {
  const imageHandlers = useImages(
    record.id,
    PRODUCT_ENDPOINTS.VARIANT_UPLOAD_IMAGES(record.id),
    PRODUCT_ENDPOINTS.VARIANT_DELETE_IMAGE(record.id),
    PRODUCT_ENDPOINTS.VARIANT_IMAGE_DETAIL,
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
      title="Quản lý ảnh biến thể"
      entityName="biến thể"
      imageSize={{ width: 60, height: 60 }}
      popupImageSize={{ width: 120, height: 120 }}
      columnWidth={120}
    />
  );
};

export default function VariantsPage() {
  // const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editingVariant, setEditingVariant] = useState({});

  // Hook tích hợp cho danh sách variants
  const {
    data: variants,
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
    fetchData: fetchVariants
  } = useListData({
    module: 'variant',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.VARIANTS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { updateData, deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.VARIANTS,
    entityName: 'biến thể',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchVariants();
    }
  }, [deleteData, fetchVariants]);

  const handleEdit = useCallback((record) => {
    console.log('Editing variant:', record); // Debug log
    setEditingId(record.id);
    const formValues = {
      product_id: record.product_id || record.product || (record.product_detail && record.product_detail.id),
      price_adjustment: record.price_adjustment ?? '',
      stock_alert_threshold: record.stock_alert_threshold ?? '',
      warranty_period: record.warranty_period ?? '',
      is_active: record.is_active,
    };
    console.log('Setting form values:', formValues); // Debug log
    setEditingVariant(formValues);
  }, []);

  const handleUpdate = useCallback(async (record) => {
    try {
      const body = {
        product_id: editingVariant.product_id,
        price_adjustment: editingVariant.price_adjustment === '' ? null : Number(editingVariant.price_adjustment),
        stock_alert_threshold: editingVariant.stock_alert_threshold === '' ? null : Number(editingVariant.stock_alert_threshold),
        warranty_period: editingVariant.warranty_period === '' ? null : Number(editingVariant.warranty_period),
        is_active: editingVariant.is_active,
      };
      
      const success = await updateData(record.id, body);
      if (success) {
      setEditingId(null);
      setEditingVariant({});
      fetchVariants();
      }
    } catch (err) {
      message.error('Lỗi khi cập nhật biến thể: ' + err.message);
    }
  }, [editingVariant, updateData, fetchVariants]);

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
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      render: (name) => (
        <div style={{ fontWeight: 500, color: '#1890ff' }}>
          {name}
        </div>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Giá điều chỉnh',
      dataIndex: 'price_adjustment',
      key: 'price_adjustment',
      width: 150,
      render: (price, record) => {
        if (editingId === record.id) {
          return (
            <Input
              type="number"
              value={editingVariant.price_adjustment}
              onChange={e => setEditingVariant({ ...editingVariant, price_adjustment: e.target.value })}
              placeholder="Giá điều chỉnh"
              style={{ width: '100%' }}
            />
          );
        }
        return price !== null && price !== undefined
          ? price.toLocaleString('vi-VN') + 'đ'
          : '-';
      },
    },
    {
      title: 'Ngưỡng tồn kho cảnh báo',
      dataIndex: 'stock_alert_threshold',
      key: 'stock_alert_threshold',
      width: 150,
      render: (stock, record) => {
        if (editingId === record.id) {
          return (
            <Input
              type="number"
              value={editingVariant.stock_alert_threshold}
              onChange={e => setEditingVariant({ ...editingVariant, stock_alert_threshold: e.target.value })}
              placeholder="Ngưỡng cảnh báo"
              style={{ width: '100%' }}
            />
          );
        }
        return stock !== null && stock !== undefined ? stock : '-';
      },
    },
    {
      title: 'Thời hạn bảo hành',
      dataIndex: 'warranty_period',
      key: 'warranty_period',
      width: 150,
      render: (warranty, record) => {
        if (editingId === record.id) {
          return (
            <Input
              type="number"
              value={editingVariant.warranty_period}
              onChange={e => setEditingVariant({ ...editingVariant, warranty_period: e.target.value })}
              placeholder="Tháng bảo hành"
              style={{ width: '100%' }}
            />
          );
        }
        return warranty !== null && warranty !== undefined
          ? `${warranty} tháng`
          : '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      width: 120,
      align: 'center',
      render: (isActive, record) => {
        if (editingId === record.id) {
      return (
            <select
              value={editingVariant.is_active}
              onChange={e => setEditingVariant({ ...editingVariant, is_active: e.target.value === 'true' })}
              style={{ width: '100%', padding: '4px 8px' }}
            >
              <option value={true}>Hoạt động</option>
              <option value={false}>Ẩn</option>
            </select>
          );
        }
        return (
          <span style={{ 
            color: isActive ? '#52c41a' : '#ff4d4f',
            fontWeight: 500 
          }}>
            {isActive ? 'Hoạt động' : 'Ẩn'}
          </span>
        );
      },
    },
    {
      title: 'Ảnh',
      key: 'images',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <VariantImageColumn 
          record={record} 
          editingId={editingId} 
          onRefresh={fetchVariants}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Space>
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleUpdate(record)}
              >
                Lưu
              </Button>
              <Button 
                size="small"
                onClick={() => {
                  setEditingId(null);
                  setEditingVariant({});
                }}
              >
                Hủy
              </Button>
            </Space>
      );
    }
    return (
          <ActionButtons
            record={record}
            onView={() => handleEdit(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
            hasAccess={hasAccess}
            showView={false}
            showEdit={checkModulePermission('variant', 'edit')}
            showDelete={checkModulePermission('variant', 'delete')}
            entityName="biến thể"
            customEditButton={
              <Button 
                type="link" 
                size="small"
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Button>
            }
          />
        );
      },
    },
  ];

  return (
    <div className="admin-variants-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="variant"
        action="view"
        showUserInfo={true}
      />

      <div className="admin-list-header">
        <h2>Quản lý biến thể</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm biến thể..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={variants}
        loading={isLoading}
        rowKey="id"
        className="variants-table"
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