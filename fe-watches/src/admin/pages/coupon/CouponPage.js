import React, { useCallback } from 'react';
import { Table, Modal, Form, Input, DatePicker, Select, InputNumber, Space, Button } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ORDER_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { 
  AccessDeniedAlert, 
  CustomPagination, 
  ActionButtons, 
  AdminPageHeader,
  SearchAndFilterBar 
} from '@/admin/components';
import { formatCurrency, formatDate, getStatusColor } from '@/admin/utils/formatters';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;

const CouponPage = () => {
  // Hook tích hợp cho danh sách coupons
  const {
    data: coupons,
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
    fetchData: fetchCoupons,
    refreshData,
    // buildQueryParams,
    filters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters
  } = useListData({
    module: 'coupon',
    action: 'view',
    apiEndpoint: ORDER_ENDPOINTS.COUPONS,
    initialFilters: {
      code: '',
      discount_type: '',
      is_active: ''
    },
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const {
    modalVisible,
    editingId,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete
  } = useCRUD({
    baseUrl: ORDER_ENDPOINTS.COUPONS,
    entityName: 'mã giảm giá',
    formatData: (data) => ({
      ...data,
      start_date: data.start_date.format('YYYY-MM-DD'),
      expires_at: data.expires_at.format('YYYY-MM-DD'),
    }),
    onSuccess: () => {
      refreshData();
    }
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  // Form instance
  const [form] = Form.useForm();

  // Filter display state
  const [showFilters, setShowFilters] = React.useState(false);

  // Xử lý clear filters
  const handleClearFilters = useCallback(() => {
    if (clearFilters) {
      clearFilters();
    }
  }, [clearFilters]);

  // Xử lý các action
  const handleEdit = useCallback((record) => {
    const initialValues = {
      code: record.code,
      description: record.description || '',
      discount_type: record.discount_type,
      discount_value: parseFloat(record.discount_value),
      minimum_order_amount: parseFloat(record.minimum_order_amount),
      start_date: dayjs(record.start_date),
      expires_at: dayjs(record.expires_at),
      usage_limit: record.usage_limit,
      is_active: record.is_active
    };
    
    // Mở modal edit
    openEditModal(record.id);
    
    // Set form values sau khi modal đã mở - tăng delay và thêm retry
    const setFormValues = () => {
      form.setFieldsValue(initialValues);
    };
    
    // Thử set values ngay lập tức
    setFormValues();
    
    // Backup: thử lại sau 200ms
    setTimeout(setFormValues, 200);
    
    // Backup: thử lại sau 500ms
    setTimeout(setFormValues, 500);
  }, [openEditModal, form]);

  const handleDeleteCoupon = useCallback(async (record) => {
    const success = await handleDelete(record.id);
    if (success) {
      refreshData();
    }
  }, [handleDelete, refreshData]);

  // Xử lý submit form
  const handleFormSubmit = useCallback(async (values) => {
    const success = await handleSubmit(values);
    if (success) {
      form.resetFields();
    }
    return success;
  }, [handleSubmit, form]);

  // Reset form khi modal đóng
  React.useEffect(() => {
    if (!modalVisible) {
      form.resetFields();
    }
  }, [modalVisible, form]);

  // State để theo dõi discount type cho placeholder
  const [discountType, setDiscountType] = React.useState('fixed');

  // Effect để cập nhật discount type khi form thay đổi
  React.useEffect(() => {
    const currentDiscountType = form.getFieldValue('discount_type');
    if (currentDiscountType) {
      setDiscountType(currentDiscountType);
    }
  }, [form]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (description) => (
        <div style={{ fontSize: '12px' }}>
          {description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : '-'}
        </div>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      width: 120,
      render: (type) => (
        <span style={{ fontWeight: 500 }}>
          {type === 'percentage' ? 'Phần trăm' : 'Cố định'}
        </span>
      ),
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discount_value',
      key: 'discount_value',
      width: 120,
      render: (value, record) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {record.discount_type === 'percentage' ? `${value}%` : formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Đơn hàng tối thiểu',
      dataIndex: 'minimum_order_amount',
      key: 'minimum_order_amount',
      width: 150,
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      render: (value) => (
        <span style={{ fontSize: '12px' }}>
          {formatDate(value, 'DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'expires_at',
      key: 'expires_at',
      width: 120,
      render: (value) => (
        <span style={{ fontSize: '12px' }}>
          {formatDate(value, 'DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Sử dụng',
      dataIndex: 'usage_limit',
      key: 'usage',
      width: 120,
      align: 'center',
      render: (usageLimit, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 500 }}>
            {record.usage_count || 0} / {usageLimit}
          </div>
          <div style={{ 
            color: record.usage_count >= usageLimit ? '#ff4d4f' : '#52c41a',
            fontSize: '10px'
          }}>
            {record.usage_count >= usageLimit ? 'Hết lượt' : 'Còn lượt'}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      align: 'center',
      render: (active, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ 
            color: getStatusColor(active ? 'delivered' : 'cancelled'),
            fontWeight: 500 
          }}>
            {active ? 'Hoạt động' : 'Không hoạt động'}
          </div>
          <div style={{ 
            color: record.is_valid ? '#52c41a' : '#ff4d4f',
            fontSize: '10px'
          }}>
            {record.is_valid ? 'Hợp lệ' : 'Không hợp lệ'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDeleteCoupon(record)}
          hasAccess={hasAccess}
          showEdit={checkModulePermission('coupon', 'edit')}
          showDelete={checkModulePermission('coupon', 'delete')}
          entityName="mã giảm giá"
        />
      ),
    },
  ];

  return (
    <div className="coupon-page">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="coupon"
        action="view"
        showUserInfo={true}
      />

      {/* Page Header */}
      <AdminPageHeader
        title="Quản lý mã giảm giá"
        searchText={searchText}
        onSearchChange={setSearchText}
        onAdd={openCreateModal}
        hasAccess={hasAccess}
        searchPlaceholder="Tìm kiếm mã giảm giá..."
        addButtonText="Thêm mã giảm giá"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Card bộ lọc chỉ hiện khi showFilters */}
      {showFilters && (
        <SearchAndFilterBar
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={handleClearFilters}
          onRefresh={refreshData}
          hasActiveFilters={hasActiveFilters || false}
          title="Bộ lọc mã giảm giá"
          filterContent={
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Mã giảm giá:</label>
                  <Input
                    placeholder="Nhập mã..."
                    value={filters?.code || ''}
                    onChange={(e) => handleFilterChange && handleFilterChange('code', e.target.value)}
                    allowClear
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Loại giảm giá:</label>
                  <Select
                    placeholder="Chọn loại"
                    value={filters?.discount_type || ''}
                    onChange={(value) => handleFilterChange && handleFilterChange('discount_type', value)}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="percentage">Phần trăm</Option>
                    <Option value="fixed">Cố định</Option>
                  </Select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Trạng thái:</label>
                  <Select
                    placeholder="Chọn trạng thái"
                    value={filters?.is_active || ''}
                    onChange={(value) => handleFilterChange && handleFilterChange('is_active', value)}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="true">Hoạt động</Option>
                    <Option value="false">Không hoạt động</Option>
                  </Select>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={coupons}
        loading={isLoading}
        rowKey="id"
        className="coupon-table"
        scroll={{ x: 1200 }}
        pagination={false}
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

      {/* Modal Form */}
      <Modal
        title={editingId ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
        destroyOnClose={false}
      >
        <Form 
          form={form} 
          onFinish={handleFormSubmit} 
          layout="vertical"
          preserve={true}
        >
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: false, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="discount_type"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
          >
            <Select>
              <Option value="percentage">Phần trăm</Option>
              <Option value="fixed">Cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discount_value"
            label="Giá trị giảm"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('discount_type') === 'percentage' && value > 100) {
                    return Promise.reject(new Error('Giảm giá theo phần trăm không được vượt quá 100%'));
                  }
                  if (value <= 0) {
                    return Promise.reject(new Error('Giá trị giảm phải lớn hơn 0'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder={discountType === 'percentage' ? 'Nhập % (ví dụ: 10)' : 'Nhập tiền (ví dụ: 100000)'}
            />
          </Form.Item>

          <Form.Item
            name="minimum_order_amount"
            label="Đơn hàng tối thiểu"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị tối thiểu' },
              { type: 'number', min: 0, message: 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="Nhập giá trị tối thiểu"
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expires_at"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && getFieldValue('start_date') && value.isBefore(getFieldValue('start_date'))) {
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="usage_limit"
            label="Giới hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập giới hạn sử dụng' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={closeModal}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponPage; 