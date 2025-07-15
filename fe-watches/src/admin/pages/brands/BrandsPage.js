import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Empty, Table, Modal, Form, Space, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;

export default function BrandsPage() {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách brands
  const {
    data: brands,
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
    fetchData: fetchBrands
  } = useListData({
    module: 'brand',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.BRANDS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.BRANDS,
    entityName: 'thương hiệu',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchBrands();
    }
  }, [deleteData, fetchBrands]);

  const handleView = useCallback((record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback((record) => {
    console.log('Editing brand:', record); // Debug log
    setEditingId(record.id);
    const formValues = {
      name: record.name,
      description: record.description,
      display_order: record.display_order,
      is_active: record.is_active
    };
    console.log('Setting form values:', formValues); // Debug log
    form.setFieldsValue(formValues);
    setModalVisible(true);
  }, [form]);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true
    });
    setModalVisible(true);
  }, [form]);

  const handleSubmit = useCallback(async (values) => {
    const formattedValues = {
      name: values.name,
      description: values.description,
      display_order: values.display_order || 0,
      is_active: values.is_active ?? true
    };

    let success = false;
    if (editingId) {
      success = await updateData(editingId, formattedValues);
    } else {
      success = await createData(formattedValues);
    }

    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchBrands();
    }
  }, [editingId, updateData, createData, form, fetchBrands]);

  // Debug: Log form values when modal opens
  React.useEffect(() => {
    if (modalVisible) {
      console.log('Modal opened, current form values:', form.getFieldsValue());
    }
  }, [modalVisible, form]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <div style={{ fontWeight: 500, color: '#1890ff' }}>
          {name}
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
      title: 'Thứ tự',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      align: 'center',
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
          showEdit={checkModulePermission('brand', 'edit')}
          showDelete={checkModulePermission('brand', 'delete')}
          entityName="thương hiệu"
        />
      ),
    },
  ];

  return (
    <div className="admin-brands-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="brand"
        action="view"
        showUserInfo={true}
      />

      <div className="admin-list-header">
        <h2>Quản lý thương hiệu</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('brand', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm thương hiệu
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={brands}
        loading={isLoading}
        rowKey="id"
        className="brands-table"
        scroll={{ x: 1200 }}
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

      {/* Modal cho thêm/sửa thương hiệu */}
      <Modal
        title={editingId ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập mô tả thương hiệu (không bắt buộc)" 
            />
          </Form.Item>



          <Form.Item
            name="display_order"
            label="Thứ tự hiển thị"
          >
            <Input 
              type="number" 
              placeholder="Nhập thứ tự hiển thị (mặc định: 0)" 
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Ẩn</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 