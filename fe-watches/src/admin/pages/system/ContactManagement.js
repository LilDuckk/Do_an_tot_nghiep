import React, { useState, useCallback } from 'react';
import { Input, Button, Empty, Table, Space, Modal, Form, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;
const { TextArea } = Input;

export default function ContactManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách contact info
  const {
    data: contactInfos,
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
    fetchData: fetchContactInfos
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.CONTACT_INFO,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.CONTACT_INFO,
    entityName: 'thông tin liên hệ',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchContactInfos();
    }
  }, [deleteData, fetchContactInfos]);

  const handleEdit = useCallback((record) => {
    console.log('Editing contact info:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      company_name: record.company_name,
      address: record.address,
      phone: record.phone,
      email: record.email,
      working_hours: record.working_hours,
      facebook_url: record.facebook_url,
      instagram_url: record.instagram_url,
      youtube_url: record.youtube_url,
      tiktok_url: record.tiktok_url,
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
      company_name: values.company_name,
      address: values.address,
      phone: values.phone,
      email: values.email,
      working_hours: values.working_hours,
      facebook_url: values.facebook_url,
      instagram_url: values.instagram_url,
      youtube_url: values.youtube_url,
      tiktok_url: values.tiktok_url,
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
      fetchContactInfos();
    }
  }, [editingId, updateData, createData, form, fetchContactInfos]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên công ty',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
      render: (name) => (
        <div className="contact-company-name" style={{ fontWeight: 'bold' }}>
          {name}
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 250,
      render: (address) => (
        <div className="contact-address">
          {address || '-'}
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="contact-info">
          {record.phone && (
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              📞 {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ fontSize: '12px' }}>
              📧 {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Giờ làm việc',
      dataIndex: 'working_hours',
      key: 'working_hours',
      width: 150,
      render: (hours) => (
        <div className="contact-hours">
          {hours || '-'}
        </div>
      ),
    },
    {
      title: 'Mạng xã hội',
      key: 'social_media',
      width: 200,
      render: (_, record) => (
        <div className="contact-social">
          {record.facebook_url && (
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
              <a href={record.facebook_url} target="_blank" rel="noopener noreferrer">
                📘 Facebook
              </a>
            </div>
          )}
          {record.instagram_url && (
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
              <a href={record.instagram_url} target="_blank" rel="noopener noreferrer">
                📷 Instagram
              </a>
            </div>
          )}
          {record.youtube_url && (
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
              <a href={record.youtube_url} target="_blank" rel="noopener noreferrer">
                📺 YouTube
              </a>
            </div>
          )}
          {record.tiktok_url && (
            <div style={{ fontSize: '12px' }}>
              <a href={record.tiktok_url} target="_blank" rel="noopener noreferrer">
                🎵 TikTok
              </a>
            </div>
          )}
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
          entityName="thông tin liên hệ"
        />
      ),
    },
  ];

  return (
    <div className="admin-contact-management">
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
            placeholder="Tìm kiếm thông tin liên hệ..."
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
              Thêm thông tin liên hệ
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={contactInfos}
        loading={isLoading}
        rowKey="id"
        className="contact-table"
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

      {/* Modal cho thêm/sửa thông tin liên hệ */}
      <Modal
        title={editingId ? 'Chỉnh sửa thông tin liên hệ' : 'Thêm thông tin liên hệ mới'}
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
            name="company_name"
            label="Tên công ty"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input placeholder="Nhập tên công ty" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập địa chỉ công ty" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          <Form.Item
            name="working_hours"
            label="Giờ làm việc"
          >
            <Input placeholder="Ví dụ: 8:00 AM - 10:00 PM" />
          </Form.Item>

          <Form.Item
            name="facebook_url"
            label="Link Facebook"
            rules={[
              { type: 'url', message: 'URL không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập link Facebook" />
          </Form.Item>

          <Form.Item
            name="instagram_url"
            label="Link Instagram"
            rules={[
              { type: 'url', message: 'URL không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập link Instagram" />
          </Form.Item>

          <Form.Item
            name="youtube_url"
            label="Link YouTube"
            rules={[
              { type: 'url', message: 'URL không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập link YouTube" />
          </Form.Item>

          <Form.Item
            name="tiktok_url"
            label="Link TikTok"
            rules={[
              { type: 'url', message: 'URL không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập link TikTok" />
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
} 