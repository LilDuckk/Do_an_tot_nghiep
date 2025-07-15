import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  DatePicker,
  Select,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CUSTOMER_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';
import { useDebounceSearch } from '@/admin/hooks/useDebounce';
import { usePagination } from '@/admin/hooks/usePagination';
import CustomPagination from '@/admin/components/common/CustomPagination';

const { Option } = Select;

const CustomersListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isSearchChange, setIsSearchChange] = useState(false);
  const prevSearchTextRef = useRef('');

  // Sử dụng useDebounceSearch hook
  const { debouncedSearchText } = useDebounceSearch(searchText, 500);
  
  // Khởi tạo giá trị ban đầu cho prevSearchTextRef
  useEffect(() => {
    if (prevSearchTextRef.current === '') {
      prevSearchTextRef.current = debouncedSearchText;
    }
  }, [debouncedSearchText]);

  // Sử dụng usePagination hook
  const {
    currentPage,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    parseApiResponse,
    handlePageChange,
    resetToFirstPage
  } = usePagination(20, 1);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      
      if (debouncedSearchText) {
        queryParams.append('search', debouncedSearchText);
      }
      
      // Thêm pagination parameters
      queryParams.append('page', currentPage);
      queryParams.append('page_size', pageSize);
      
      const response = await fetch(`${CUSTOMER_ENDPOINTS.CUSTOMERS}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setCustomers([]);
        parseApiResponse(null);
        return;
      }

      const data = await response.json();
      setCustomers(Array.isArray(data.results) ? data.results : []);
      parseApiResponse(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
      setCustomers([]);
      parseApiResponse(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, currentPage, pageSize, parseApiResponse]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset isSearchChange flag sau khi fetch thành công
  useEffect(() => {
    if (isSearchChange) {
      setIsSearchChange(false);
    }
  }, [customers, isSearchChange]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    if (debouncedSearchText !== prevSearchTextRef.current && prevSearchTextRef.current !== '') {
      setIsSearchChange(true);
      resetToFirstPage();
    }
    prevSearchTextRef.current = debouncedSearchText;
  }, [debouncedSearchText, resetToFirstPage]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        first_name: values.first_name,
        last_name: values.last_name || null,
        email: values.email || null,
        phone: values.phone,
        address: values.address || null,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        gender: values.gender,
        notes: values.notes || null
      };

      if (editingId) {
        const response = await fetch(CUSTOMER_ENDPOINTS.CUSTOMER_DETAIL(editingId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật khách hàng này.');
          return;
        }

        message.success('Cập nhật khách hàng thành công');
      } else {
        const response = await fetch(CUSTOMER_ENDPOINTS.CUSTOMERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo khách hàng mới.');
          return;
        }

        message.success('Tạo khách hàng thành công');
      }
      setModalVisible(false);
      form.resetFields();
      // Refresh lại dữ liệu với pagination hiện tại
      fetchCustomers();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(CUSTOMER_ENDPOINTS.CUSTOMER_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa khách hàng này.');
        return;
      }

      message.success('Xóa khách hàng thành công');
      
      // Kiểm tra nếu đang ở trang cuối và chỉ còn 1 item, chuyển về trang trước
      if (customers.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else {
        // Refresh lại dữ liệu với pagination hiện tại
        fetchCustomers();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns = [
    {
      title: 'Họ',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Tên',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        const genderMap = {
          male: 'Nam',
          female: 'Nữ',
          other: 'Khác'
        };
        return genderMap[gender] || gender;
      },
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
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
                birth_date: record.birth_date ? dayjs(record.birth_date) : null,
              });
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
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý khách hàng</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        className="customers-table"
        pagination={false} // Tắt pagination mặc định của Antd Table
      />

      {/* Custom Pagination */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={handlePageChange}
          hasAccess={true}
          maxVisiblePages={5}
          className="admin-pagination"
        />
      </div>

      <Modal
        title={editingId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="first_name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Họ"
            rules={[{ required: false, message: 'Vui lòng nhập họ' }]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: false, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input maxLength={255} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input maxLength={20} />
          </Form.Item>

          <Form.Item
            name="birth_date"
            label="Ngày sinh"
            rules={[{ required: false, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: false, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomersListPage; 