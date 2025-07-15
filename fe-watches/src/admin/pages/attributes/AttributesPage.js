import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Empty, Table, Space, Modal, Form, Select, message, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;

// Component cho Attribute Types
const AttributeTypesSection = ({ onTypeChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách attribute types
  const {
    data: attributeTypes,
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
    fetchData: fetchAttributeTypes
  } = useListData({
    module: 'attribute',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.ATTRIBUTE_TYPES,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.ATTRIBUTE_TYPES,
    entityName: 'loại thuộc tính',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
    fetchAttributeTypes();
      onTypeChange(); // Refresh attribute values
    }
  }, [deleteData, fetchAttributeTypes, onTypeChange]);

  const handleEdit = useCallback((record) => {
    console.log('Editing attribute type:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description
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
      description: values.description || ''
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
      fetchAttributeTypes();
      onTypeChange(); // Refresh attribute values
    }
  }, [editingId, updateData, createData, form, fetchAttributeTypes, onTypeChange]);

  // Định nghĩa columns cho Ant Design Table - đã bỏ cột thứ tự và trạng thái
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên loại',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <div className="attribute-type-name">
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
        <div className="attribute-type-desc">
          {description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : '-'}
        </div>
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
          showEdit={checkModulePermission('attribute', 'edit')}
          showDelete={checkModulePermission('attribute', 'delete')}
          entityName="loại thuộc tính"
        />
      ),
    },
  ];

  return (
    <div className="admin-attributes-section">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="attribute"
        action="view"
        showUserInfo={false}
      />
      <div className="admin-list-header">
          <div className="search-bar">
          <Input
            placeholder="Tìm kiếm loại thuộc tính..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('attribute', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm loại thuộc tính
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={attributeTypes}
        loading={isLoading}
        rowKey="id"
        className="attribute-types-table"
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

      {/* Modal cho thêm/sửa loại thuộc tính */}
      <Modal
        title={editingId ? 'Chỉnh sửa loại thuộc tính' : 'Thêm loại thuộc tính mới'}
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
            label="Tên loại thuộc tính"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại thuộc tính' }]}
          >
            <Input placeholder="Nhập tên loại thuộc tính" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập mô tả (không bắt buộc)" 
            />
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

// Component cho Attribute Values
const AttributeValuesSection = ({ attributeTypes }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [selectedAttributeType, setSelectedAttributeType] = useState(null);

  // Hook tích hợp cho danh sách attribute values
  const {
    data: attributeValues,
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
    fetchData: fetchAttributeValues
  } = useListData({
    module: 'attribute',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.ATTRIBUTE_VALUES,
    pageSize: 20,
    debounceDelay: 500,
    initialFilters: { attribute_type: null }
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: PRODUCT_ENDPOINTS.ATTRIBUTE_VALUES,
    entityName: 'giá trị thuộc tính',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchAttributeValues();
    }
  }, [deleteData, fetchAttributeValues]);

  const handleEdit = useCallback((record) => {
    console.log('Editing attribute value:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      value: record.value,
      attribute_type: record.attribute_type
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
      value: values.value,
      attribute_type: values.attribute_type
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
      fetchAttributeValues();
    }
  }, [editingId, updateData, createData, form, fetchAttributeValues]);

  // Xử lý thay đổi filter loại thuộc tính
  const handleAttributeTypeFilter = useCallback((value) => {
    setSelectedAttributeType(value);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [setCurrentPage]);

  // Lọc dữ liệu theo loại thuộc tính được chọn
  const filteredAttributeValues = selectedAttributeType 
    ? attributeValues.filter(item => item.attribute_type === selectedAttributeType)
    : attributeValues;

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      render: (value) => (
        <div className="attribute-value-name">
          {value}
        </div>
      ),
    },
    {
      title: 'Loại thuộc tính',
      dataIndex: 'attribute_type',
      key: 'attribute_type',
      width: 200,
      render: (attributeTypeId) => {
        const attributeType = attributeTypes.find(type => type.id === attributeTypeId);
        return attributeType ? attributeType.name : 'N/A';
      },
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
          showEdit={checkModulePermission('attribute', 'edit')}
          showDelete={checkModulePermission('attribute', 'delete')}
          entityName="giá trị thuộc tính"
        />
      ),
    },
  ];

  return (
    <div className="admin-attributes-section">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="attribute"
        action="view"
        showUserInfo={false}
      />
      <div className="admin-list-header">
            <div className="search-bar">
              <Input
                placeholder="Tìm kiếm giá trị thuộc tính..."
                prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
            disabled={!hasAccess}
          />
          <Select
            placeholder="Lọc theo loại thuộc tính"
            value={selectedAttributeType}
            onChange={handleAttributeTypeFilter}
            style={{ width: 200 }}
            allowClear
            disabled={!hasAccess}
          >
            {attributeTypes.map(type => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
          {checkModulePermission('attribute', 'create') && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
              onClick={handleAdd}
                >
                  Thêm giá trị thuộc tính
                </Button>
              )}
            </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAttributeValues}
        loading={isLoading}
        rowKey="id"
        className="attribute-values-table"
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

      {/* Modal cho thêm/sửa giá trị thuộc tính */}
      <Modal
        title={editingId ? 'Chỉnh sửa giá trị thuộc tính' : 'Thêm giá trị thuộc tính mới'}
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
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
          >
            <Input placeholder="Nhập giá trị thuộc tính" />
          </Form.Item>

          <Form.Item
            name="attribute_type"
            label="Loại thuộc tính"
            rules={[{ required: true, message: 'Vui lòng chọn loại thuộc tính' }]}
          >
            <Select placeholder="Chọn loại thuộc tính">
                            {attributeTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
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

export default function AttributesPage() {
  const navigate = useNavigate();
  const [attributeTypes, setAttributeTypes] = useState([]);

  // Hook để lấy danh sách attribute types cho dropdown
  const {
    data: typesData,
    fetchData: fetchTypes
  } = useListData({
    module: 'attribute',
    action: 'view',
    apiEndpoint: PRODUCT_ENDPOINTS.ATTRIBUTE_TYPES,
    pageSize: 1000, // Lấy tất cả để làm dropdown
    debounceDelay: 0
  });

  // Cập nhật attribute types khi data thay đổi
  React.useEffect(() => {
    if (typesData) {
      setAttributeTypes(typesData);
    }
  }, [typesData]);

  // Callback để refresh attribute values khi types thay đổi
  const handleTypeChange = useCallback(() => {
    fetchTypes();
  }, [fetchTypes]);

  // Định nghĩa các tab items
  const tabItems = [
    {
      key: 'types',
      label: 'Loại thuộc tính',
      children: <AttributeTypesSection onTypeChange={handleTypeChange} />
    },
    {
      key: 'values',
      label: 'Giá trị thuộc tính',
      children: <AttributeValuesSection attributeTypes={attributeTypes} />
    }
  ];

  return (
    <div className="admin-attributes-list">
      <div className="admin-list-header">
        <h2>Quản lý thuộc tính</h2>
        </div>

      <div className="admin-tables-container">
        <Tabs 
          defaultActiveKey="types" 
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