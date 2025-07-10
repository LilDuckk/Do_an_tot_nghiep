import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, Select, Space, Badge, Tag, Button } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { STORE_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

// Import hooks
import { useListData, useCRUD } from '@/admin/hooks';

// Import components
import { AdminPageHeader, AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';

const { Option } = Select;

const StoresPage = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchManagerText, setSearchManagerText] = useState('');

  // Hook tích hợp cho danh sách stores
  const {
    data: stores,
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
    fetchData: fetchStores
  } = useListData({
    module: 'store',
    action: 'view',
    apiEndpoint: STORE_ENDPOINTS.STORES,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: STORE_ENDPOINTS.STORES,
    entityName: 'cửa hàng',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Fetch employee count for each store
  const fetchEmployeeCount = useCallback(async (storeId) => {
    if (!hasAccess) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORE_EMPLOYEE_COUNT(storeId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployeeCounts(prev => ({
          ...prev,
          [storeId]: data.employee_count
        }));
      }
    } catch (error) {
      console.error('Error fetching employee count:', error);
    }
  }, [hasAccess]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.EMPLOYEES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  }, [hasAccess]);

  // Fetch employee counts when stores data changes
  useEffect(() => {
    if (stores && stores.length > 0) {
      stores.forEach(store => {
        fetchEmployeeCount(store.id);
      });
    }
  }, [stores, fetchEmployeeCount]);

  // Initialize employees data
  useEffect(() => {
    if (hasAccess) {
      fetchEmployees();
    }
  }, [hasAccess, fetchEmployees]);

  // Handle form submission
  const handleSubmit = async (values) => {
    const formattedValues = {
      name: values.name,
      address: values.address,
      phone: values.phone,
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
      fetchStores();
    }
  };

  // Get manager options for autocomplete
  const getManagerOptions = () => {
    return employees
      .filter(emp => {
        if (!emp) return false;
        const searchLower = searchManagerText.toLowerCase();
        return (
          (emp.name?.toLowerCase() || '').includes(searchLower) ||
          (emp.employee_code?.toLowerCase() || '').includes(searchLower) ||
          (emp.is_manager === true)
        );
      })
      .map(emp => ({
        value: `${emp.name || ''} - ${emp.employee_code || ''}`,
        label: `${emp.name || ''} - ${emp.employee_code || ''}`,
        employee: emp
      }));
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Quản lý',
      key: 'managers',
      render: (_, record) => (
        <>
          {record.managers && record.managers.length > 0 ? (
            record.managers.map((manager, index) => (
              <div key={index} style={{ marginBottom: index < record.managers.length - 1 ? '4px' : '0' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                <Tag color="blue">{manager.name}</Tag>
              </div>
            ))
          ) : (
            <Tag color="default">Chưa có quản lý</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Số nhân viên',
      key: 'employee_count',
      render: (_, record) => (
        <Badge 
          count={employeeCounts[record.id] || 0} 
          showZero
          style={{ backgroundColor: 'rgb(96 131 207)' }}
        >
          <TeamOutlined style={{ fontSize: '20px' }} />
        </Badge>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => isActive ? 'Hoạt động' : 'Không hoạt động',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={() => {
            setEditingId(record.id);
            form.setFieldsValue({
              ...record,
              manager: record.manager ? `${record.manager.name} - ${record.manager.employee_code}` : undefined
            });
            setSelectedManager(record.manager);
            setModalVisible(true);
          }}
          onDelete={async () => {
            const success = await deleteData(record.id);
            if (success) {
              fetchStores();
            }
          }}
          hasAccess={hasAccess}
          entityName="cửa hàng"
        />
      ),
    },
  ];

  return (
    <div className="admin-stores-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="store"
        action="view"
        showUserInfo={true}
      />
      
      <AdminPageHeader
        title="Quản lý cửa hàng"
        searchText={searchText}
        onSearchChange={setSearchText}
        onAdd={() => {
          setEditingId(null);
          form.resetFields();
          setSelectedManager(null);
          setModalVisible(true);
        }}
        hasAccess={hasAccess}
        searchPlaceholder="Tìm kiếm cửa hàng..."
        addButtonText="Thêm cửa hàng"
      />

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={stores}
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
        title={editingId ? "Sửa cửa hàng" : "Thêm cửa hàng mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên cửa hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
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
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
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

export default StoresPage; 