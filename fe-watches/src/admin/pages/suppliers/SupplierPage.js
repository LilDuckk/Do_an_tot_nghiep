import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, Select, Space, Tag, Button, message } from 'antd';
import { SUPPLIER_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

// Import hooks
import { useListData, useCRUD } from '@/admin/hooks';

// Import components
import { AdminPageHeader, AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';

const { Option } = Select;

const SupplierPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách suppliers
  const {
    data: suppliers,
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
    fetchData: fetchSuppliers
  } = useListData({
    module: 'supplier',
    action: 'view',
    apiEndpoint: SUPPLIER_ENDPOINTS.SUPPLIERS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: SUPPLIER_ENDPOINTS.SUPPLIERS,
    entityName: 'nhà cung cấp',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Helper function để reset form
  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      is_active: true
    });
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    // Ép kiểu boolean cho is_active
    const formattedValues = {
      ...values,
      is_active: values.is_active === 'true' || values.is_active === true
    };

    let success = false;
    if (editingId) {
      success = await updateData(editingId, formattedValues);
    } else {
      success = await createData(formattedValues);
    }

    if (success) {
      setModalVisible(false);
      resetForm();
      fetchSuppliers();
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'tax_code',
      key: 'tax_code',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={() => {
            setEditingId(record.id);
            const formData = {
              name: record.name,
              contact_person: record.contact_person,
              email: record.email,
              phone: record.phone,
              address: record.address,
              tax_code: record.tax_code,
              website: record.website,
              is_active: record.is_active ? 'true' : 'false'
            };
            form.setFieldsValue(formData);
            setModalVisible(true);
          }}
          onDelete={async () => {
            const success = await deleteData(record.id);
            if (success) {
              fetchSuppliers();
            }
          }}
          hasAccess={hasAccess}
          entityName="nhà cung cấp"
        />
      ),
    },
  ];

  return (
    <div className="admin-users-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess}
        module="supplier"
        action="view"
        showUserInfo={true}
      />

      <AdminPageHeader
        title="Quản lý nhà cung cấp"
        searchText={searchText}
        onSearchChange={setSearchText}
        onAdd={() => {
          setEditingId(null);
          resetForm();
          setModalVisible(true);
        }}
        hasAccess={hasAccess}
        searchPlaceholder="Tìm kiếm theo tên, email, SĐT, mã số thuế..."
        addButtonText="Thêm nhà cung cấp"
      />

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={suppliers}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          className="admin-table"
          scroll={{ x: true }}
        />
      </div>

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

      <Modal
        title={editingId ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: 'true' }}
        >
          <Form.Item 
            name="name" 
            label="Tên nhà cung cấp" 
            rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item name="contact_person" label="Người liên hệ">
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item name="phone" label="SĐT">
            <Input maxLength={30} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item name="tax_code" label="Mã số thuế">
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item name="is_active" label="Trạng thái">
            <Select>
              <Option value="true">Đang hoạt động</Option>
              <Option value="false">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                resetForm();
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

export default SupplierPage; 