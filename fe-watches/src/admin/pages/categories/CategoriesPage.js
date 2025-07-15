import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Empty, Table, Modal, Form, Select, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);

  // Hook tích hợp cho danh sách categories
  const {
    data: categories,
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
    fetchData: fetchCategories
  } = useListData({
    module: 'category',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.CATEGORIES,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.CATEGORIES,
    entityName: 'danh mục',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  // Fetch parent categories for dropdown
  const fetchParentCategories = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PRODUCT_ENDPOINTS.CATEGORIES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out current editing category to prevent circular references
        const filteredCategories = editingId 
          ? data.filter(cat => cat.id !== editingId)
          : data;
        setParentCategories(filteredCategories);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  }, [hasAccess, editingId]);

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchCategories();
    }
  }, [deleteData, fetchCategories]);

  const handleView = useCallback((record) => {
    // Có thể mở modal xem chi tiết hoặc navigate
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parent: record.parent || undefined,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback((record) => {
    console.log('Editing record:', record); // Debug log
    setEditingId(record.id);
    const formValues = {
      name: record.name,
      description: record.description,
      parent: record.parent || undefined,
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
      parent: values.parent || null,
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
      fetchCategories();
    }
  }, [editingId, updateData, createData, form, fetchCategories]);

  // Fetch parent categories when modal opens
  React.useEffect(() => {
    if (modalVisible) {
      fetchParentCategories();
    }
  }, [modalVisible, fetchParentCategories]);

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
      title: 'Tên danh mục',
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
      title: 'Danh mục cha',
      dataIndex: 'parent_detail',
      key: 'parent',
      width: 150,
      render: (parentDetail, record) => (
        <span style={{ fontWeight: 500 }}>
          {parentDetail?.name || record.parent_name || '-'}
        </span>
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
          showEdit={checkModulePermission('category', 'edit')}
          showDelete={checkModulePermission('category', 'delete')}
          entityName="danh mục"
        />
      ),
    },
  ];

  return (
    <div className="admin-categories-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="category"
        action="view"
        showUserInfo={true}
      />

      <div className="admin-list-header">
        <h2>Quản lý danh mục</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('category', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm danh mục
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        rowKey="id"
        className="categories-table"
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

      {/* Modal cho thêm/sửa danh mục */}
      <Modal
        title={editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập mô tả danh mục (không bắt buộc)" 
            />
          </Form.Item>

          <Form.Item
            name="parent"
            label="Danh mục cha"
          >
            <Select
              placeholder="Chọn danh mục cha (không bắt buộc)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {parentCategories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
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