import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, message, Modal, Form, Select, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SUPPLIER_ENDPOINTS } from '@/config/api';
import { useDebounce } from '@/admin/hooks/useDebounce';
import '@/admin/static/AdminCommon.css';

const { confirm } = Modal;

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = debouncedSearchText ? `?search=${encodeURIComponent(debouncedSearchText)}` : '';
      const res = await fetch(`${SUPPLIER_ENDPOINTS.SUPPLIERS}${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách nhà cung cấp');
      const data = await res.json();
      setSuppliers(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách nhà cung cấp');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [debouncedSearchText]);

  const handleAdd = () => {
    setEditingSupplier(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSupplier(record);
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa nhà cung cấp này?',
      icon: <ExclamationCircleOutlined />,
      content: record.name,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(SUPPLIER_ENDPOINTS.SUPPLIER_DETAIL(record.id), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Xóa thất bại');
          message.success('Đã xóa nhà cung cấp');
          fetchSuppliers();
        } catch (err) {
          message.error('Không thể xóa');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Ép kiểu boolean cho is_active
      values.is_active = values.is_active === 'true';
      const token = localStorage.getItem('accessToken');
      const method = editingSupplier ? 'PUT' : 'POST';
      const url = editingSupplier ? SUPPLIER_ENDPOINTS.SUPPLIER_DETAIL(editingSupplier.id) : SUPPLIER_ENDPOINTS.SUPPLIERS;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error(editingSupplier ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
      message.success(editingSupplier ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setModalVisible(false);
      fetchSuppliers();
    } catch (err) {
      if (err.errorFields) return; // validation error
      message.error(err.message);
    }
  };

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
      render: (active) => <Tag color="default">{active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Tag>,
      filters: [
        { text: 'Đang hoạt động', value: true },
        { text: 'Ngừng hoạt động', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="action-btn"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />} className="action-btn" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý nhà cung cấp</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT, mã số thuế..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchSuppliers} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        rowKey="id"
        className="admin-table"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText={editingSupplier ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnHidden
        afterOpenChange={(open) => {
          if (open && !editingSupplier) form.resetFields();
          if (open && editingSupplier) form.setFieldsValue(editingSupplier);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ is_active: true }}
        >
          <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="contact_person" label="Người liên hệ">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
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
              <Select.Option value="true">Đang hoạt động</Select.Option>
              <Select.Option value="false">Ngừng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierPage; 