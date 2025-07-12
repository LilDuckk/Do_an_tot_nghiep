import React, { useState, useCallback } from 'react';
import { Input, Button, Empty, Table, Space, Modal, Form, Select, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;

// Component cho Footer Categories
const FooterCategoriesSection = ({ onCategoryChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách footer categories
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
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.FOOTER_CATEGORIES,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.FOOTER_CATEGORIES,
    entityName: 'danh mục footer',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchCategories();
      onCategoryChange(); // Refresh footer links
    }
  }, [deleteData, fetchCategories, onCategoryChange]);

  const handleEdit = useCallback((record) => {
    console.log('Editing footer category:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setModalVisible(true);
  }, [form]);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleSubmit = useCallback(async (values) => {
    const formattedValues = {
      name: values.name,
      display_order: Number(values.display_order),
      is_active: values.is_active
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
      onCategoryChange(); // Refresh footer links
    }
  }, [editingId, updateData, createData, form, fetchCategories, onCategoryChange]);

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
        <div className="footer-category-name">
          {name}
        </div>
      ),
    },
    {
      title: 'Thứ tự hiển thị',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 150,
      render: (order) => (
        <div className="footer-category-order">
          {order}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
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
          onView={() => handleEdit(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          hasAccess={hasAccess}
          showView={false}
          showEdit={checkModulePermission('content', 'edit')}
          showDelete={checkModulePermission('content', 'delete')}
          entityName="danh mục footer"
        />
      ),
    },
  ];

  return (
    <div className="admin-footer-categories-section">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="content"
        action="view"
        showUserInfo={false}
      />
      <div className="admin-list-header">
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm danh mục footer..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('content', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm danh mục footer
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        rowKey="id"
        className="footer-categories-table"
        scroll={{ x: 800 }}
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

      {/* Modal cho thêm/sửa danh mục footer */}
      <Modal
        title={editingId ? 'Chỉnh sửa danh mục footer' : 'Thêm danh mục footer mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={500}
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
            <Input placeholder="Nhập tên danh mục footer" />
          </Form.Item>

          <Form.Item
            name="display_order"
            label="Thứ tự hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
          >
            <Input type="number" placeholder="Nhập thứ tự hiển thị" min="1" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Select placeholder="Chọn trạng thái">
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
};

// Component cho Footer Links
const FooterLinksSection = ({ categories }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách footer links
  const {
    data: links,
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
    fetchData: fetchLinks
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.FOOTER_LINKS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.FOOTER_LINKS,
    entityName: 'liên kết footer',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchLinks();
    }
  }, [deleteData, fetchLinks]);

  const handleEdit = useCallback((record) => {
    console.log('Editing footer link:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      title: record.title,
      url: record.url,
      category_id: record.category?.id || record.category_id,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setModalVisible(true);
  }, [form]);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleSubmit = useCallback(async (values) => {
    const formattedValues = {
      title: values.title,
      name: values.title, // API yêu cầu cả title và name
      url: values.url,
      category_id: Number(values.category_id),
      display_order: Number(values.display_order),
      is_active: values.is_active
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
      fetchLinks();
    }
  }, [editingId, updateData, createData, form, fetchLinks]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title) => (
        <div className="footer-link-title">
          {title}
        </div>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 250,
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="footer-link-url">
          {url}
        </a>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => (
        <div className="footer-link-category">
          {category?.name || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Thứ tự hiển thị',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 150,
      render: (order) => (
        <div className="footer-link-order">
          {order}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
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
          onView={() => handleEdit(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          hasAccess={hasAccess}
          showView={false}
          showEdit={checkModulePermission('content', 'edit')}
          showDelete={checkModulePermission('content', 'delete')}
          entityName="liên kết footer"
        />
      ),
    },
  ];

  return (
    <div className="admin-footer-links-section">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="content"
        action="view"
        showUserInfo={false}
      />
      <div className="admin-list-header">
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm liên kết footer..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('content', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm liên kết footer
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={links}
        loading={isLoading}
        rowKey="id"
        className="footer-links-table"
        scroll={{ x: 1000 }}
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

      {/* Modal cho thêm/sửa liên kết footer */}
      <Modal
        title={editingId ? 'Chỉnh sửa liên kết footer' : 'Thêm liên kết footer mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề liên kết" />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Vui lòng nhập URL' }]}
          >
            <Input placeholder="Nhập URL liên kết" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="display_order"
            label="Thứ tự hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
          >
            <Input type="number" placeholder="Nhập thứ tự hiển thị" min="1" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Select placeholder="Chọn trạng thái">
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
};

export default function FooterManagement() {
  const [categories, setCategories] = useState([]);

  // Hook để lấy danh sách categories cho dropdown
  const {
    data: categoriesData,
    fetchData: fetchCategories
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.FOOTER_CATEGORIES,
    pageSize: 1000, // Lấy tất cả để làm dropdown
    debounceDelay: 0
  });

  // Cập nhật categories khi data thay đổi
  React.useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Callback để refresh footer links khi categories thay đổi
  const handleCategoryChange = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Định nghĩa các tab items
  const tabItems = [
    {
      key: 'categories',
      label: 'Danh mục Footer',
      children: <FooterCategoriesSection onCategoryChange={handleCategoryChange} />
    },
    {
      key: 'links',
      label: 'Liên kết Footer',
      children: <FooterLinksSection categories={categories} />
    }
  ];

  return (
    <div className="admin-footer-management">
      <div className="admin-list-header">
        <h2>Quản lý thông tin chân trang</h2>
      </div>

      <div className="admin-tables-container">
        <Tabs 
          defaultActiveKey="categories" 
          items={tabItems}
          size="large"
          tabBarStyle={{ 
            marginBottom: 24,
            borderBottom: '1px solid #f0f0f0'
          }}
          tabBarGutter={16}
        />
      </div>
    </div>
  );
} 