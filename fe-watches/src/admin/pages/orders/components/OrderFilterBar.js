import React from 'react';
import { Card, Row, Col, Select, Input, DatePicker, InputNumber, Button, Space, Spin } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchStores } from '@/admin/hooks/useSearchStores';
import { useSearchEmployees } from '@/admin/hooks/useSearchEmployees';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function OrderFilterBar({
  filterType, setFilterType,
  searchText, setSearchText,
  dateRange, setDateRange,
  statusFilter, setStatusFilter,
  paymentMethodFilter, setPaymentMethodFilter,
  paymentStatusFilter, setPaymentStatusFilter,
  shippingMethodFilter, setShippingMethodFilter,
  isOnlineOrderFilter, setIsOnlineOrderFilter,
  totalAmountMin, setTotalAmountMin,
  totalAmountMax, setTotalAmountMax,
  storeFilter, setStoreFilter,
  employeeFilter, setEmployeeFilter,
  showFilters,
  clearOrderFilters,
  isSuperUser = false
}) {
  // Tìm kiếm động cửa hàng
  const {
    stores,
    loading: storesLoading,
    searchText: storeSearchText,
    setSearchText: setStoreSearchText
  } = useSearchStores();

  // Tìm kiếm động nhân viên
  const {
    employees,
    loading: employeesLoading,
    searchText: employeeSearchText,
    setSearchText: setEmployeeSearchText
  } = useSearchEmployees();

  if (!showFilters) return null;
  return (
    <Card
      className="filter-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterOutlined />
          <span>Tìm kiếm và bộ lọc đơn hàng</span>
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      <div className={`filter-container filter-show`}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 150 }}
                placeholder="Chọn bộ lọc"
              >
                <Option value="customer_first_name">Tên khách hàng</Option>
                <Option value="customer_last_name">Họ khách hàng</Option>
                <Option value="customer_email">Email khách hàng</Option>
                <Option value="customer_phone">SĐT khách hàng</Option>
                <Option value="store_name">Tên cửa hàng</Option>
                <Option value="employee_name">Tên nhân viên</Option>
                <Option value="employee_email">Email nhân viên</Option>
                <Option value="order_id">Mã đơn hàng</Option>
              </Select>
              <Input
                className="filter-search-input"
                placeholder="Nhập thông tin tìm kiếm..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ flex: 1 }}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              placeholder={['Ngày đặt hàng từ', 'Ngày đặt hàng đến']}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái đơn hàng"
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy trạng thái"
              optionFilterProp="children"
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="shipped">Đã giao hàng</Option>
              <Option value="delivered">Đã nhận hàng</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Phương thức thanh toán"
              value={paymentMethodFilter || undefined}
              onChange={setPaymentMethodFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy phương thức"
              optionFilterProp="children"
            >
              <Option value="cash">Tiền mặt</Option>
              <Option value="credit_card">Thẻ tín dụng</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái thanh toán"
              value={paymentStatusFilter || undefined}
              onChange={setPaymentStatusFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy trạng thái"
              optionFilterProp="children"
            >
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="failed">Thanh toán thất bại</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Phương thức vận chuyển"
              value={shippingMethodFilter || undefined}
              onChange={setShippingMethodFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy phương thức"
              optionFilterProp="children"
            >
              <Option value="standard">Tiêu chuẩn</Option>
              <Option value="express">Nhanh</Option>
              <Option value="overnight">Qua đêm</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Loại đơn hàng"
              value={isOnlineOrderFilter || undefined}
              onChange={setIsOnlineOrderFilter}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy loại đơn hàng"
              optionFilterProp="children"
            >
              <Option value="true">Đơn hàng online</Option>
              <Option value="false">Đơn hàng offline</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Tìm kiếm cửa hàng..."
              value={storeFilter || undefined}
              onChange={setStoreFilter}
              allowClear
              style={{ width: '100%' }}
              disabled={!isSuperUser}
              showSearch
              filterOption={false}
              onSearch={setStoreSearchText}
              notFoundContent={storesLoading ? <Spin size="small" /> : 'Không tìm thấy cửa hàng'}
              optionFilterProp="children"
            >
              {stores.map(store => (
                <Option key={store.id} value={store.id}>
                  {store.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Tìm kiếm nhân viên..."
              value={employeeFilter || undefined}
              onChange={setEmployeeFilter}
              allowClear
              style={{ width: '100%' }}
              disabled={!isSuperUser}
              showSearch
              filterOption={false}
              onSearch={setEmployeeSearchText}
              notFoundContent={employeesLoading ? <Spin size="small" /> : 'Không tìm thấy nhân viên'}
              optionFilterProp="children"
            >
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name || employee.employee_code || (employee.user_details && employee.user_details.username) || ''}
                  {employee.phone && ` - ${employee.phone}`}
                  {employee.position && ` (${employee.position})`}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <InputNumber
              placeholder="Tổng tiền tối thiểu"
              value={totalAmountMin}
              onChange={setTotalAmountMin}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <InputNumber
              placeholder="Tổng tiền tối đa"
              value={totalAmountMax}
              onChange={setTotalAmountMax}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Col>
          <Col xs={24}>
            <Space>
              <Button
                className="filter-clear-btn"
                type="primary"
                icon={<FilterOutlined />}
                onClick={clearOrderFilters}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </Card>
  );
} 