import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, Select, Space, Badge, Tag, Button, Checkbox } from 'antd';
import { UserOutlined, ShopOutlined, IdcardOutlined, CrownOutlined } from '@ant-design/icons';
import { USER_ENDPOINTS, AUTH_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

// Import hooks
import { useListData, useCRUD } from '@/admin/hooks';

// Import components
import { AdminPageHeader, AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';

const { Option } = Select;

const UsersListPage = () => {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách users
  const {
    data: users,
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
    fetchData: fetchUsers
  } = useListData({
    module: 'user',
    action: 'view',
    apiEndpoint: USER_ENDPOINTS.USERS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: USER_ENDPOINTS.USERS,
    entityName: 'người dùng',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Helper function để reset form
  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      is_staff: false,
      is_superuser: false,
      groups_id: []
    });
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    // Validation: Nếu không phải superuser thì phải có ít nhất 1 nhóm
    if (!values.is_superuser && (!values.groups_id || values.groups_id.length === 0)) {
      form.setFields([
        {
          name: 'groups_id',
          errors: ['Tài khoản phải thuộc ít nhất 1 nhóm, trừ khi là tài khoản quản trị viên']
        }
      ]);
      return;
    }

    const formattedValues = {
      username: values.username,
      email: values.email,
      is_active: values.is_active ?? true,
      is_staff: values.is_staff ?? false,
      is_superuser: values.is_superuser ?? false,
      groups_id: values.groups_id || []
    };

    let success = false;
    if (editingId) {
      success = await updateData(editingId, formattedValues);
    } else {
      // Thêm password cho user mới
      if (!values.password) {
        form.setFields([
          {
            name: 'password',
            errors: ['Vui lòng nhập mật khẩu']
          }
        ]);
        return;
      }
      formattedValues.password = values.password;
      success = await createData(formattedValues);
    }

    if (success) {
      setModalVisible(false);
      resetForm();
      fetchUsers();
    }
  };

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(AUTH_ENDPOINTS.GROUPS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Đảm bảo groups luôn là array
        const groupsData = Array.isArray(data) ? data : 
                          (data.results && Array.isArray(data.results)) ? data.results : [];
        setGroups(groupsData);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  }, [hasAccess]);

  // Initialize data
  useEffect(() => {
    if (hasAccess) {
      fetchGroups();
    }
  }, [hasAccess, fetchGroups]);

  // Table columns configuration
  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Họ và tên',
      key: 'full_name',
      render: (_, record) => {
        // Ưu tiên hiển thị tên từ employee_details nếu có
        if (record.employee_details && record.employee_details.name) {
          return record.employee_details.name;
        }
        // Nếu không có employee_details, hiển thị first_name + last_name
        const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
        return fullName || record.username || 'N/A';
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Thông tin nhân viên',
      key: 'employee_info',
      render: (_, record) => {
        if (record.employee_details) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IdcardOutlined style={{ color: '#1890ff' }} />
                <Tag color="blue">{record.employee_details.employee_code}</Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CrownOutlined style={{ color: '#52c41a' }} />
                <Tag color="green">{record.employee_details.position}</Tag>
              </div>
              {record.employee_details.store_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShopOutlined style={{ color: '#722ed1' }} />
                  <Tag color="purple">{record.employee_details.store_name}</Tag>
                </div>
              )}
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserOutlined style={{ color: '#d9d9d9' }} />
            <Tag color="default">Không phải nhân viên</Tag>
          </div>
        );
      },
    },
    {
      title: 'Nhóm quyền',
      key: 'groups',
      render: (_, record) => (
        <>
          {Array.isArray(record.groups) && record.groups.length > 0 ? (
            record.groups.map((group, index) => (
              <Tag key={index} color="blue">{group.name}</Tag>
            ))
          ) : (
            <Tag color="default">Không có nhóm</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Badge 
          status={isActive ? 'success' : 'error'} 
          text={isActive ? 'Hoạt động' : 'Không hoạt động'} 
        />
      ),
    },
    {
      title: 'Vai trò',
      key: 'roles',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {record.is_superuser && (
            <Tag color="red">Quản trị viên</Tag>
          )}
          {record.is_staff && !record.is_superuser && (
            <Tag color="orange">Nhân viên</Tag>
          )}
          {!record.is_staff && !record.is_superuser && (
            <Tag color="default">Người dùng</Tag>
          )}
        </div>
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
              username: record.username,
              email: record.email,
              is_active: record.is_active,
              is_staff: record.is_staff,
              is_superuser: record.is_superuser,
              groups_id: Array.isArray(record.groups) ? record.groups.map(g => g.id) : []
            };
            form.setFieldsValue(formData);
            setModalVisible(true);
          }}
          onDelete={async () => {
            const success = await deleteData(record.id);
            if (success) {
              fetchUsers();
            }
          }}
          hasAccess={hasAccess}
          entityName="người dùng"
        />
      ),
    },
  ];

  return (
    <div className="admin-users-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess}
        module="user"
        action="view"
        showUserInfo={true}
      />

      <AdminPageHeader
        title="Quản lý người dùng"
        searchText={searchText}
        onSearchChange={setSearchText}
        onAdd={() => {
          setEditingId(null);
          resetForm();
          setModalVisible(true);
        }}
        hasAccess={hasAccess}
        searchPlaceholder="Tìm kiếm người dùng..."
        addButtonText="Thêm người dùng"
      />

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          className="admin-table"
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
        title={editingId ? "Sửa người dùng" : "Thêm người dùng mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          {/* Hiển thị thông tin nhân viên nếu có */}
          {editingId && users.find(u => u.id === editingId)?.employee_details && (
            <Form.Item label="Thông tin nhân viên">
              <div style={{ padding: '12px', background: '#f6f6f6', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <IdcardOutlined style={{ color: '#1890ff' }} />
                  <strong>Mã nhân viên:</strong> 
                  <Tag color="blue">{users.find(u => u.id === editingId)?.employee_details.employee_code}</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CrownOutlined style={{ color: '#52c41a' }} />
                  <strong>Vị trí:</strong> 
                  <Tag color="green">{users.find(u => u.id === editingId)?.employee_details.position}</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShopOutlined style={{ color: '#722ed1' }} />
                  <strong>Cửa hàng:</strong> 
                  <Tag color="purple">{users.find(u => u.id === editingId)?.employee_details.store_name}</Tag>
                </div>
              </div>
            </Form.Item>
          )}

          <Form.Item
            name="groups_id"
            label="Nhóm quyền"
          >
            <Select 
              mode="multiple" 
              placeholder="Chọn nhóm quyền"
              disabled={form.getFieldValue('is_superuser')}
            >
              {Array.isArray(groups) && groups.map(group => (
                <Option key={group.id} value={group.id}>{group.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {form.getFieldValue('is_superuser') && (
            <div style={{ color: '#666', fontSize: '12px', marginTop: '-8px' }}>
              Tài khoản quản trị viên không cần nhóm quyền
            </div>
          )}

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

          <Form.Item
            name="is_staff"
            label="Nhân viên"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>Là nhân viên</Checkbox>
          </Form.Item>

          <Form.Item
            name="is_superuser"
            label="Quản trị viên"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox 
              onChange={(e) => {
                if (e.target.checked) {
                  form.setFieldsValue({ groups_id: [] });
                }
              }}
            >
              Là quản trị viên
            </Checkbox>
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

export default UsersListPage;