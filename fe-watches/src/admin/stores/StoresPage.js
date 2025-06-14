import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  AutoComplete,
  Badge,
  Alert,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { STORE_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';



const { Option } = Select;

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [employees, setEmployees] = useState([]);
  const [searchManagerText, setSearchManagerText] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [employeeCounts, setEmployeeCounts] = useState({});
  const [hasAccess, setHasAccess] = useState(true);
  const accessErrorShown = useRef(false);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const showAccessError = useCallback((msg) => {
    if (!accessErrorShown.current) {
      message.error(msg);
      accessErrorShown.current = true;
    }
  }, []);

  const fetchStores = useCallback(async () => {
    if (!hasAccess || accessErrorShown.current) return false;
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (debouncedSearchText) {
        queryParams.append('search', debouncedSearchText);
      }
      const response = await fetch(`${STORE_ENDPOINTS.STORES}/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền xem danh sách cửa hàng.');
        setStores([]);
        return false;
      }
      const data = await response.json();
      const storesData = Array.isArray(data.results) ? data.results : [];
      setStores(storesData);
      // Gọi API lấy số lượng nhân viên cho từng cửa hàng
      storesData.forEach(store => {
        fetchEmployeeCount(store.id);
      });
      return true;
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
      setStores([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, hasAccess, showAccessError]);
  
  const fetchEmployeeCount = async (storeId) => {
    if (!hasAccess || accessErrorShown.current) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORE_EMPLOYEE_COUNT(storeId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền xem số lượng nhân viên.');
        return;
      }
      const data = await response.json();
      setEmployeeCounts(prev => ({
        ...prev,
        [storeId]: data.employee_count
      }));
    } catch (error) {
      console.error('Lỗi khi lấy số lượng nhân viên:', error);
    }
  };
  

  

  const fetchEmployees = async () => {
    if (!hasAccess || accessErrorShown.current) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/stores/employees/list_all/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403 || response.status === 401) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền xem danh sách nhân viên.');
        return;
      }
      const data = await response.json();
      setEmployees(data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên');
    }
  };
  

  useEffect(() => {
    if (!hasAccess || accessErrorShown.current) return;
    const fetchAll = async () => {
      const ok = await fetchStores();
      if (ok) {
        fetchEmployees();
      }
    };
    fetchAll();
  }, [debouncedSearchText, hasAccess, showAccessError]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        name: values.name,
        address: values.address,
        phone: values.phone,
        is_active: values.is_active ?? true
      };

      if (editingId) {
        const response = await fetch(STORE_ENDPOINTS.STORE_DETAIL(editingId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật cửa hàng này.');
          return;
        }

        message.success('Cập nhật cửa hàng thành công');
      } else {
        const response = await fetch(STORE_ENDPOINTS.STORES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo cửa hàng mới.');
          return;
        }

        message.success('Tạo cửa hàng mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      if (!hasAccess || accessErrorShown.current) return;
      fetchStores();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORE_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa cửa hàng này.');
        return;
      }

      message.success('Xóa cửa hàng thành công');
      if (!hasAccess || accessErrorShown.current) return;
      fetchStores();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

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
      dataIndex: 'managers',
      key: 'managers',
      render: (managers) => {
        if (!managers || managers.length === 0) return '-';
        return managers.map(manager => 
          `${manager.name} - ${manager.employee_code}`
        ).join(', ');
      }
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
      render: (active) => (active ? 'Hoạt động' : 'Không hoạt động'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue({
                ...record,
                manager: record.manager ? `${record.manager.name} - ${record.manager.employee_code}` : undefined
              });
              setSelectedManager(record.manager);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="coupon-page">
      {!hasAccess && (
        <Alert
          message="Không có quyền truy cập"
          description="Bạn không có quyền xem hoặc thực hiện các thao tác trên trang này. Vui lòng liên hệ quản trị viên để được cấp quyền."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div className="coupon-header">
        <h2>Quản lý cửa hàng</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm cửa hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setSelectedManager(null);
              setModalVisible(true);
            }}
            disabled={!hasAccess}
          >
            Thêm cửa hàng
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={stores}
        rowKey="id"
        loading={loading}
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