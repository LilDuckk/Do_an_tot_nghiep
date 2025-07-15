import React from 'react';
import { Tabs, Row, Col, Select, Spin, Table, Tag } from 'antd';
import { Tooltip as AntTooltip } from 'antd';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { formatVND } from '@/admin/utils/formatters';
import { chartOptions, productPerformanceChartOptions } from '../utils/chartConfigs';
import { 
  bestSellersColumns, 
  turnoverColumns, 
  returnOrdersColumns, 
} from '../utils/tableColumns';

const DashboardTabs = ({
  dataReady,
  // Chart data
  revenueChartData,
  monthlyChartData,
  bestSellersChartData,
  turnoverChartData,
  profitDistributionData,
  returnProductChartData,
  warrantyProductChartData,
  topProductsChartData,
  topCustomersChartData,
  bestSellingChartData,
  productPerformanceChartData,
  // Table data
  bestSellers,
  inventoryTurnover,
  returnSummary,
  warrantySummary,
  profitAnalysis,
  financialImpact,
  topProducts,
  topCustomers,
  bestSelling,
  // Revenue data
  dailyRevenue,
  monthlyRevenue,
  // Product performance
  selectedProduct,
  setSelectedProduct,
  selectedVariant,
  setSelectedVariant,
  products,
  variants,
  productsLoading,
  variantsLoading,
  performancePeriod,
  setPerformancePeriod,
  productPerformance,
  comprehensiveAnalysis
}) => {
  if (!dataReady) return null;

  const financialImpactData = financialImpact?.financial_impact || {};
  const textColor = typeof window !== 'undefined' ? (getComputedStyle(document.documentElement).getPropertyValue('--text') || '#ffffff') : '#23272f';

  const getTextColor = () => {
    if (typeof window !== 'undefined') {
      const adminLayout = document.querySelector('.admin-layout');
      if (adminLayout) {
        const color = getComputedStyle(adminLayout).getPropertyValue('--text');
        return color && color.trim() ? color.trim() : '#23272f';
      }
    }
    return '#23272f';
  };

  return (
    <Tabs 
      defaultActiveKey="1" 
      className="dashboard-tabs"
      items={[
        {
          key: '1',
          label: 'Biểu đồ doanh thu',
          children: (
            <>
              {/* Filters Section */}
              <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col xs={24}>
                  <div className="product-performance-filters-container">
                    <div className="product-performance-filters-content">
                      <div className="product-performance-period-badge">
                        <strong>📊 Bộ lọc đang áp dụng:</strong>
                      </div>
                      {dailyRevenue?.summary?.period && (
                        <div className="product-performance-period-badge" style={{marginTop: 8}}>
                          <strong>📅 Kỳ báo cáo:</strong> {dailyRevenue.summary.period.start_date} - {dailyRevenue.summary.period.end_date}
                        </div>
                      )}
                      {dailyRevenue?.summary?.store_name ? (
                        <div className="product-performance-period-badge" style={{marginTop: 8}}>
                          <strong>🏪 Cửa hàng:</strong> {dailyRevenue.summary.store_name}
                        </div>
                      ) : (
                        <div className="product-performance-period-badge" style={{marginTop: 8}}>
                          <strong>🏪 Cửa hàng:</strong> Tất cả cửa hàng
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Summary Cards */}
              <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col xs={24} sm={12} md={6}>
                  <div className="revenue-summary-card">
                    <div className="revenue-summary-icon">💰</div>
                    <div className="revenue-summary-content">
                      <div className="revenue-summary-label">Tổng doanh thu gốc</div>
                      <div className="revenue-summary-value">{formatVND(dailyRevenue?.summary?.total_gross_revenue || 0)}₫</div>
                      <div className="revenue-summary-period">
                        {dailyRevenue?.summary?.period && (
                          `${new Date(dailyRevenue.summary.period.start_date).toLocaleDateString('vi-VN')} - ${new Date(dailyRevenue.summary.period.end_date).toLocaleDateString('vi-VN')}`
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="revenue-summary-card">
                    <div className="revenue-summary-icon">💵</div>
                    <div className="revenue-summary-content">
                      <div className="revenue-summary-label">Doanh thu thực</div>
                      <div className="revenue-summary-value">{formatVND(dailyRevenue?.summary?.total_net_revenue || 0)}₫</div>
                      <div className="revenue-summary-subtitle">
                        Tỷ lệ giảm giá: {dailyRevenue?.summary?.average_discount_rate?.toFixed(2) || 0}%
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="revenue-summary-card">
                    <div className="revenue-summary-icon">🛒</div>
                    <div className="revenue-summary-content">
                      <div className="revenue-summary-label">Tổng đơn hàng</div>
                      <div className="revenue-summary-value">{dailyRevenue?.summary?.total_orders || 0}</div>
                      <div className="revenue-summary-subtitle">
                        TB/đơn: {formatVND(dailyRevenue?.summary?.average_order_value || 0)}₫
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="revenue-summary-card">
                    <div className="revenue-summary-icon">👥</div>
                    <div className="revenue-summary-content">
                      <div className="revenue-summary-label">Khách hàng</div>
                      <div className="revenue-summary-value">{dailyRevenue?.summary?.total_customers || 0}</div>
                      <div className="revenue-summary-subtitle">
                        Sản phẩm: {dailyRevenue?.summary?.total_items || 0}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Charts */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container">
                    <div className="dashboard-table-title">
                      Biểu đồ doanh thu theo ngày
                      <div className="revenue-chart-subtitle">
                        Hiển thị doanh thu gốc, thực, giảm giá và số đơn hàng
                      </div>
                    </div>
                    <div style={{height: 350}}>
                      <Line data={revenueChartData} options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'Doanh thu (VNĐ)'
                            }
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                              display: true,
                              text: 'Số đơn hàng'
                            },
                            grid: {
                              drawOnChartArea: false,
                            },
                          }
                        }
                      }} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container">
                    <div className="dashboard-table-title">
                      Doanh thu theo tháng
                      <div className="revenue-chart-subtitle">
                        So sánh doanh thu gốc, thực và giảm giá theo tháng
                      </div>
                    </div>
                    <div style={{height: 350}}>
                      <Bar data={monthlyChartData} options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'Doanh thu (VNĐ)'
                            }
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                              display: true,
                              text: 'Số đơn hàng'
                            },
                            grid: {
                              drawOnChartArea: false,
                            },
                          }
                        }
                      }} />
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )
        },
        {
          key: '2',
          label: 'Hiệu suất bán hàng',
          children: (
            <>
              {/* Filters Section */}
              <Row gutter={[16, 16]} className="product-performance-filters-section">
                <Col xs={24}>
                  <div className="product-performance-filters-container">
                    <div className="product-performance-filters-content">
                      {productPerformance?.period && (
                        <div className="product-performance-period-badge">
                          <strong>📅 Kỳ báo cáo:</strong> {productPerformance.period.start_date} - {productPerformance.period.end_date}
                        </div>
                      )}
                      <div className="product-performance-filter-group">
                        <label className="product-performance-filter-label">📦 Chọn sản phẩm</label>
                        <Select
                          showSearch
                          placeholder="Tìm và chọn sản phẩm"
                          value={selectedProduct}
                          onChange={setSelectedProduct}
                          className="product-performance-select"
                          loading={productsLoading}
                          allowClear
                          notFoundContent={productsLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
                          filterOption={(input, option) => {
                            const searchText = input.toLowerCase();
                            const productName = option.label?.props?.children?.[0]?.props?.children || option.label || '';
                            const sku = option.sku ? option.sku.toLowerCase() : '';
                            return productName.toLowerCase().includes(searchText) || sku.includes(searchText);
                          }}
                          options={products.map(p => ({ 
                            value: p.id, 
                            label: (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{p.name || p.product_name}</span>
                                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                  {p.sku || p.variant_sku || p.product_sku || 'N/A'}
                                </span>
                              </div>
                            ),
                            sku: p.sku || p.variant_sku || p.product_sku || ''
                          }))}
                          optionLabelProp="label"
                        />
                      </div>
                      {selectedProduct && (
                        <div className="product-performance-filter-group">
                          <label className="product-performance-filter-label">🔧 Chọn biến thể</label>
                          <Select
                            showSearch
                            placeholder="Chọn biến thể sản phẩm"
                            value={selectedVariant}
                            onChange={setSelectedVariant}
                            className="product-performance-select"
                            loading={variantsLoading}
                            allowClear
                            notFoundContent={variantsLoading ? <Spin size="small" /> : "Không tìm thấy biến thể"}
                            filterOption={(input, option) => {
                              const searchText = input.toLowerCase();
                              const variantSku = option.label?.props?.children?.[0]?.props?.children || option.label || '';
                              const attributes = option.attributes ? option.attributes.toLowerCase() : '';
                              return variantSku.toLowerCase().includes(searchText) || attributes.includes(searchText);
                            }}
                            options={variants.map(v => ({ 
                              value: v.id, 
                              label: (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{v.sku || `Variant ${v.id}`}</span>
                                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                    {v.attribute_values_detail ? 
                                      v.attribute_values_detail.map(attr => `${attr.attribute_type.name}: ${attr.value}`).join(', ') : 
                                      'N/A'
                                    }
                                  </span>
                                </div>
                              ),
                              attributes: v.attribute_values_detail ? 
                                v.attribute_values_detail.map(attr => `${attr.attribute_type.name}: ${attr.value}`).join(', ') : ''
                            }))}
                            optionLabelProp="label"
                          />
                        </div>
                      )}
                      <div className="product-performance-filter-group">
                        <label className="product-performance-filter-label">📊 Kỳ báo cáo</label>
                        <Select
                          value={performancePeriod}
                          onChange={setPerformancePeriod}
                          className="product-performance-period-select"
                          options={[
                            { value: 'daily', label: 'Theo ngày' },
                            { value: 'weekly', label: 'Theo tuần' },
                            { value: 'monthly', label: 'Theo tháng' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Product Info Cards */}
              {productPerformance?.product_info && (
                <Row gutter={[16, 16]} className="product-info-cards-row">
                  <Col xs={24} sm={12} md={6}>
                    <div className="product-info-card">
                      <div className="product-info-icon">📦</div>
                      <div className="product-info-label">Sản phẩm</div>
                      <div className="product-info-value product-info-value-blue">{productPerformance.product_info.product_name}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="product-info-card">
                      <div className="product-info-icon">🏷️</div>
                      <div className="product-info-label">Thương hiệu</div>
                      <div className="product-info-value product-info-value-green">{productPerformance.product_info.brand_name}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="product-info-card">
                      <div className="product-info-icon">💰</div>
                      <div className="product-info-label">Giá hiện tại</div>
                      <div className="product-info-value product-info-value-orange">{formatVND(productPerformance.product_info.current_price || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="product-info-card">
                      <div className="product-info-icon">📦</div>
                      <div className="product-info-label">Tồn kho</div>
                      <div className="product-info-value product-info-value-purple">{formatVND(productPerformance.product_info.current_stock || 0)}</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Main Charts Section */}
              <Row gutter={[16, 16]} className="product-performance-charts-row">
                <Col xs={24} lg={16}>
                  <div className="product-performance-chart-container">
                    <div className="product-performance-chart-title">📈 Hiệu suất bán hàng theo thời gian</div>
                    {selectedVariant && (
                      <div className="product-performance-chart-content">
                        <Line data={productPerformanceChartData} options={productPerformanceChartOptions} />
                      </div>
                    )}
                    {!selectedVariant && selectedProduct && (
                      <div className="product-performance-placeholder">
                        <div className="product-performance-placeholder-icon">🔧</div>
                        <div>Vui lòng chọn biến thể sản phẩm để xem hiệu suất bán hàng</div>
                      </div>
                    )}
                    {!selectedProduct && (
                      <div className="product-performance-placeholder">
                        <div className="product-performance-placeholder-icon">📦</div>
                        <div>Vui lòng chọn sản phẩm để xem hiệu suất bán hàng</div>
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={24} lg={8}>
                  <div className="product-performance-chart-container">
                    <div className="product-performance-chart-title">📊 Phân bố doanh thu</div>
                    {productPerformance?.sales_performance ? (
                      <div className="product-performance-chart-content" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Doughnut 
                          data={{
                            labels: ['Doanh thu gốc', 'Giảm giá', 'Doanh thu thực'],
                            datasets: [{
                              data: [
                                productPerformance.sales_performance.total_revenue || 0,
                                productPerformance.sales_performance.total_discount || 0,
                                productPerformance.sales_performance.net_revenue || 0
                              ],
                              backgroundColor: ['#1890ff', '#ff4d4f', '#52c41a'],
                              borderWidth: 0,
                              cutout: '60%',
                            }]
                          }} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  padding: 20,
                                  usePointStyle: true
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="product-performance-placeholder">
                        <div className="product-performance-placeholder-icon">📊</div>
                        <div>Chưa có dữ liệu doanh thu</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Sales Performance Cards */}
              {productPerformance?.sales_performance && (
                <Row gutter={[16, 16]} className="sales-performance-cards-row">
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Tổng số lượng bán</div>
                      <div className="sales-performance-value sales-performance-value-blue">{formatVND(productPerformance.sales_performance.total_quantity_sold || 0)}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Doanh thu gốc</div>
                      <div className="sales-performance-value sales-performance-value-green sales-performance-value-small">{formatVND(productPerformance.sales_performance.total_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🎯</div>
                      <div className="sales-performance-label">Doanh thu thực</div>
                      <div className="sales-performance-value sales-performance-value-orange sales-performance-value-small">{formatVND(productPerformance.sales_performance.net_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📋</div>
                      <div className="sales-performance-label">Tổng đơn hàng</div>
                      <div className="sales-performance-value sales-performance-value-purple">{formatVND(productPerformance.sales_performance.total_orders || 0)}</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Detailed Performance Metrics */}
              <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col xs={24} lg={12}>
                  <div className="performance-metrics-container">
                    <div className="performance-metrics-title">📈 Chỉ số hiệu suất</div>
                    {productPerformance?.sales_performance ? (
                      <div className="performance-metrics-grid">
                        <div className="performance-metric-item performance-metric-item-green">
                          <div className="performance-metric-label">Giá trung bình/đơn vị</div>
                          <div className="performance-metric-value performance-metric-value-green">{formatVND(productPerformance.sales_performance.average_unit_price || 0)}₫</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-orange">
                          <div className="performance-metric-label">Giá bán trung bình</div>
                          <div className="performance-metric-value performance-metric-value-orange">{formatVND(productPerformance.sales_performance.average_selling_price || 0)}₫</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-red">
                          <div className="performance-metric-label">Tỷ lệ giảm giá</div>
                          <div className="performance-metric-value performance-metric-value-red">{(productPerformance.sales_performance.discount_rate || 0).toFixed(2)}%</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-blue">
                          <div className="performance-metric-label">Tỷ lệ luân chuyển</div>
                          <div className="performance-metric-value performance-metric-value-blue">{(productPerformance.sales_performance.turnover_rate || 0).toFixed(2)}%</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-purple">
                          <div className="performance-metric-label">SL trung bình/đơn</div>
                          <div className="performance-metric-value performance-metric-value-purple">{(productPerformance.sales_performance.average_quantity_per_order || 0).toFixed(1)}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-cyan">
                          <div className="performance-metric-label">DT trung bình/đơn</div>
                          <div className="performance-metric-value performance-metric-value-cyan">{formatVND(productPerformance.sales_performance.average_revenue_per_order || 0)}₫</div>
                        </div>
                      </div>
                    ) : (
                      <div className="product-performance-placeholder">
                        <div className="product-performance-placeholder-icon">📊</div>
                        <div>Chưa có dữ liệu hiệu suất</div>
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="performance-metrics-container">
                    <div className="performance-metrics-title">🔄 Phân tích trả hàng & bảo hành</div>
                    {productPerformance?.return_warranty_analysis ? (
                      <div className="performance-metrics-grid">
                        <div className="performance-metric-item performance-metric-item-volcano">
                          <div className="performance-metric-label">Tổng đơn trả hàng</div>
                          <div className="performance-metric-value performance-metric-value-volcano">{formatVND(productPerformance.return_warranty_analysis.total_returns || 0)}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-red">
                          <div className="performance-metric-label">Tỷ lệ trả hàng</div>
                          <div className="performance-metric-value performance-metric-value-red">{(productPerformance.return_warranty_analysis.return_rate || 0).toFixed(2)}%</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-green">
                          <div className="performance-metric-label">Tổng đơn bảo hành</div>
                          <div className="performance-metric-value performance-metric-value-green">{formatVND(productPerformance.return_warranty_analysis.total_warranties || 0)}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-blue">
                          <div className="performance-metric-label">Tỷ lệ bảo hành</div>
                          <div className="performance-metric-value performance-metric-value-blue">{(productPerformance.return_warranty_analysis.warranty_rate || 0).toFixed(2)}%</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-orange">
                          <div className="performance-metric-label">Tổng tiền hoàn</div>
                          <div className="performance-metric-value performance-metric-value-orange">{formatVND(productPerformance.return_warranty_analysis.total_refund || 0)}₫</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-magenta">
                          <div className="performance-metric-label">Chi phí sửa chữa</div>
                          <div className="performance-metric-value performance-metric-value-magenta">{formatVND(productPerformance.return_warranty_analysis.total_repair_cost || 0)}₫</div>
                        </div>
                      </div>
                    ) : (
                      <div className="product-performance-placeholder">
                        <div className="product-performance-placeholder-icon">🔄</div>
                        <div>Chưa có dữ liệu trả hàng & bảo hành</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Top Customers Chart */}
              {productPerformance?.top_customers && productPerformance.top_customers.length > 0 && (
                <Row gutter={[16, 16]} className="top-customers-row">
                  <Col xs={24} lg={12}>
                    <div className="top-customers-chart-container">
                      <div className="top-customers-chart-title">👥 Top khách hàng mua sản phẩm</div>
                      <div className="top-customers-chart-content">
                        <Bar 
                          data={{
                            labels: productPerformance.top_customers.map(c => c.customer_name),
                            datasets: [{
                              label: 'Tổng chi tiêu (VNĐ)',
                              data: productPerformance.top_customers.map(c => c.total_spent),
                              backgroundColor: 'rgba(24, 144, 255, 0.8)',
                              borderRadius: 6,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: function(value) {
                                    return formatVND(value) + '₫';
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="top-customers-table-container">
                      <div className="top-customers-table-title">📋 Chi tiết khách hàng</div>
                      <Table
                        dataSource={productPerformance.top_customers}
                        columns={[
                          {
                            title: 'Khách hàng',
                            dataIndex: 'customer_name',
                            key: 'customer_name',
                            render: (text, record) => (
                              <div className="customer-name-cell">
                                <div className="customer-name-primary">{text}</div>
                                <div className="customer-name-secondary">{record.customer_phone || 'N/A'}</div>
                              </div>
                            ),
                          },
                          {
                            title: 'Số lượng',
                            dataIndex: 'total_quantity',
                            key: 'total_quantity',
                            render: (value) => formatVND(value || 0),
                          },
                          {
                            title: 'Chi tiêu',
                            dataIndex: 'total_spent',
                            key: 'total_spent',
                            render: (value) => (
                              <span className="customer-spent-value">
                                {formatVND(value || 0)}₫
                              </span>
                            ),
                          },
                        ]}
                        pagination={false}
                        size="small"
                        scroll={{ y: 200 }}
                      />
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )
        },
        {
          key: '3',
          label: 'Sản phẩm bán chạy',
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                  <div className="dashboard-table-title">Top sản phẩm bán chạy</div>
                  <div style={{height: 250}}>
                    <Bar data={bestSellersChartData} options={chartOptions} />
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="dashboard-table-container">
                  <div className="dashboard-table-title">Bảng chi tiết sản phẩm bán chạy</div>
                  <Table
                    dataSource={Array.isArray(bestSellers?.best_sellers) ? bestSellers.best_sellers : []}
                    columns={bestSellersColumns}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                  />
                </div>
              </Col>
            </Row>
          )
        },
        {
          key: '4',
          label: 'Luân chuyển tồn kho',
          children: (
            <>
              {/* Inventory Turnover Summary Cards */}
              {inventoryTurnover?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Tổng sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-blue">{inventoryTurnover.summary.total_products || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🛒</div>
                      <div className="sales-performance-label">Số lượng bán</div>
                      <div className="sales-performance-value sales-performance-value-green">{inventoryTurnover.summary.total_quantity_sold || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Tổng doanh thu</div>
                      <div className="sales-performance-value sales-performance-value-orange sales-performance-value-small">{formatVND(inventoryTurnover.summary.total_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Tỷ lệ TB</div>
                      <div className="sales-performance-value sales-performance-value-purple">{(inventoryTurnover.summary.average_turnover_rate || 0).toFixed(1)}</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Additional Summary Cards */}
              {inventoryTurnover?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🏪</div>
                      <div className="sales-performance-label">Tồn kho hiện tại</div>
                      <div className="sales-performance-value sales-performance-value-blue">{inventoryTurnover.summary.total_current_stock || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📅</div>
                      <div className="sales-performance-label">Ngày tồn TB</div>
                      <div className="sales-performance-value sales-performance-value-green">{(inventoryTurnover.summary.average_days_of_inventory || 0).toFixed(1)} ngày</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📈</div>
                      <div className="sales-performance-label">Hiệu quả luân chuyển</div>
                      <div className="sales-performance-value sales-performance-value-orange">
                        {inventoryTurnover.summary.average_turnover_rate > 10 ? 'Tốt' : 
                         inventoryTurnover.summary.average_turnover_rate > 5 ? 'Trung bình' : 'Cần cải thiện'}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">⚡</div>
                      <div className="sales-performance-label">Tốc độ bán</div>
                      <div className="sales-performance-value sales-performance-value-purple">
                        {inventoryTurnover.summary.average_days_of_inventory < 30 ? 'Nhanh' : 
                         inventoryTurnover.summary.average_days_of_inventory < 90 ? 'Trung bình' : 'Chậm'}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Charts and Table */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Tỷ lệ luân chuyển tồn kho</div>
                    <div style={{height: 300}}>
                      <Bar data={turnoverChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Bảng chi tiết luân chuyển tồn kho</div>
                    <Table
                      dataSource={Array.isArray(inventoryTurnover?.inventory_turnover) ? inventoryTurnover.inventory_turnover : []}
                      columns={turnoverColumns}
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </div>
                </Col>
              </Row>
            </>
          )
        },
        {
          key: '5',
          label: 'Phân tích lợi nhuận',
          children: (
            <>
              {/* Summary Cards */}
              {profitAnalysis?.period && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24}>
                    <div className="product-performance-filters-container">
                      <div className="product-performance-period-badge">
                        <strong>📊 Bộ lọc đang áp dụng:</strong>
                      </div>
                      <div className="product-performance-period-badge" style={{marginTop: 8}}>
                        <strong>📅 Kỳ phân tích:</strong> {profitAnalysis.period.start_date} - {profitAnalysis.period.end_date}
                      </div>
                      {profitAnalysis?.store_name ? (
                        <div className="product-performance-period-badge" style={{marginTop: 8}}>
                          <strong>🏪 Cửa hàng:</strong> {profitAnalysis.store_name}
                        </div>
                      ) : (
                        <div className="product-performance-period-badge" style={{marginTop: 8}}>
                          <strong>🏪 Cửa hàng:</strong> Tất cả cửa hàng
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              )}

              {/* Revenue Analysis */}
              {profitAnalysis && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Doanh thu gộp</div>
                      <div className="sales-performance-value sales-performance-value-blue">{formatVND(profitAnalysis.revenue?.gross_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💵</div>
                      <div className="sales-performance-label">Doanh thu ròng</div>
                      <div className="sales-performance-value sales-performance-value-green">{formatVND(profitAnalysis.revenue?.net_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📉</div>
                      <div className="sales-performance-label">Tổng giảm giá</div>
                      <div className="sales-performance-value sales-performance-value-orange">{formatVND(profitAnalysis.revenue?.total_discounts || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Tỷ lệ giảm giá</div>
                      <div className="sales-performance-value sales-performance-value-purple">{(profitAnalysis.revenue?.discount_rate || 0).toFixed(2)}%</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Cost Analysis */}
              {profitAnalysis && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💳</div>
                      <div className="sales-performance-label">Tổng giá vốn</div>
                      <div className="sales-performance-value sales-performance-value-orange">{formatVND(profitAnalysis.cost_of_goods_sold?.total_cost || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Tỷ lệ giá vốn</div>
                      <div className="sales-performance-value sales-performance-value-purple">{(profitAnalysis.cost_of_goods_sold?.cost_percentage || 0).toFixed(2)}%</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Giá vốn/sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-blue">{formatVND(profitAnalysis.cost_of_goods_sold?.cost_per_item || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🛒</div>
                      <div className="sales-performance-label">Giá vốn/đơn hàng</div>
                      <div className="sales-performance-value sales-performance-value-green">{formatVND(profitAnalysis.cost_of_goods_sold?.cost_per_order || 0)}₫</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Profit Analysis */}
              {profitAnalysis && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📈</div>
                      <div className="sales-performance-label">Lợi nhuận gộp</div>
                      <div className="sales-performance-value sales-performance-value-green">{formatVND(profitAnalysis.profit?.gross_profit || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Biên lợi nhuận</div>
                      <div className="sales-performance-value sales-performance-value-blue">{(profitAnalysis.profit?.gross_profit_margin || 0).toFixed(2)}%</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🛒</div>
                      <div className="sales-performance-label">Lợi nhuận/đơn</div>
                      <div className="sales-performance-value sales-performance-value-orange">{formatVND(profitAnalysis.profit?.profit_per_order || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Lợi nhuận/sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-purple">{formatVND(profitAnalysis.profit?.profit_per_item || 0)}₫</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Volume & Ratios */}
              {profitAnalysis && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Tổng đơn hàng</div>
                      <div className="sales-performance-value sales-performance-value-blue">{profitAnalysis.volume?.total_orders || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Tổng sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-green">{profitAnalysis.volume?.total_items || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Giá trị TB/đơn</div>
                      <div className="sales-performance-value sales-performance-value-orange">{formatVND(profitAnalysis.volume?.average_order_value || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Tỷ lệ chi phí/DT</div>
                      <div className="sales-performance-value sales-performance-value-purple">{(profitAnalysis.cost_of_goods_sold?.cost_to_revenue_ratio || 0).toFixed(2)}</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Charts */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container">
                    <div className="dashboard-table-title">
                      Phân bố lợi nhuận
                      <div className="revenue-chart-subtitle">
                        So sánh lợi nhuận gộp và giá vốn hàng bán
                      </div>
                    </div>
                    <div style={{height: 350, display: 'flex', justifyContent: 'center'}}>
                      <div style={{width: 300}}>
                        <Doughnut data={profitDistributionData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container">
                    <div className="dashboard-table-title">
                      Phân tích doanh thu
                      <div className="revenue-chart-subtitle">
                        So sánh doanh thu gộp, ròng và giảm giá
                      </div>
                    </div>
                    <div style={{height: 350}}>
                      <Bar data={{
                        labels: ['Doanh thu gộp', 'Doanh thu ròng', 'Tổng giảm giá', 'Tổng giá vốn', 'Lợi nhuận gộp'],
                        datasets: [{
                          label: 'Số tiền (VNĐ)',
                          data: [
                            profitAnalysis?.revenue?.gross_revenue || 0,
                            profitAnalysis?.revenue?.net_revenue || 0,
                            profitAnalysis?.revenue?.total_discounts || 0,
                            profitAnalysis?.cost_of_goods_sold?.total_cost || 0,
                            profitAnalysis?.profit?.gross_profit || 0
                          ],
                          backgroundColor: [
                            'rgba(24, 144, 255, 0.8)',
                            'rgba(82, 196, 26, 0.8)',
                            'rgba(250, 173, 20, 0.8)',
                            'rgba(255, 77, 79, 0.8)',
                            'rgba(114, 46, 209, 0.8)'
                          ],
                          borderRadius: 8,
                        }]
                      }} options={chartOptions} />
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )
        },
        {
          key: '6',
          label: 'Trả hàng',
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                  <div className="dashboard-table-title">Top sản phẩm trả hàng</div>
                  <div style={{height: 250}}>
                    <Bar data={returnProductChartData} options={chartOptions} />
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="dashboard-table-container">
                  <div className="dashboard-table-title">Bảng chi tiết trả hàng</div>
                  <Table
                    dataSource={Array.isArray(returnSummary?.product_analysis) ? returnSummary.product_analysis : []}
                    columns={returnOrdersColumns}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                  />
                </div>
              </Col>
            </Row>
          )
        },
        {
          key: '7',
          label: 'Bảo hành',
          children: (
            <>
              {/* Warranty Summary Cards */}
              {warrantySummary?.period && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24}>
                    <div className="product-performance-filters-container">
                      <div className="product-performance-period-badge">
                        <strong>📅 Kỳ báo cáo bảo hành:</strong> {warrantySummary.period.start_date} - {warrantySummary.period.end_date}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Warranty Summary Cards */}
              {warrantySummary?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🛡️</div>
                      <div className="sales-performance-label">Tổng bảo hành</div>
                      <div className="sales-performance-value sales-performance-value-blue">{warrantySummary.summary.total_warranties || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📋</div>
                      <div className="sales-performance-label">Yêu cầu bảo hành</div>
                      <div className="sales-performance-value sales-performance-value-green">{warrantySummary.summary.total_warranty_claims || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Chi phí sửa chữa</div>
                      <div className="sales-performance-value sales-performance-value-orange sales-performance-value-small">{formatVND(warrantySummary.summary.total_repair_cost || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">Tỷ lệ yêu cầu</div>
                      <div className="sales-performance-value sales-performance-value-purple">{(warrantySummary.summary.claim_rate || 0).toFixed(1)}%</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Warranty Status Analysis */}
              {warrantySummary?.warranty_status && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} lg={12}>
                    <div className="performance-metrics-container">
                      <div className="performance-metrics-title">📊 Trạng thái bảo hành</div>
                      <div className="performance-metrics-grid">
                        <div className="performance-metric-item performance-metric-item-green">
                          <div className="performance-metric-label">Đang hoạt động</div>
                          <div className="performance-metric-value performance-metric-value-green">{warrantySummary.warranty_status.active || 0}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-red">
                          <div className="performance-metric-label">Đã hết hạn</div>
                          <div className="performance-metric-value performance-metric-value-red">{warrantySummary.warranty_status.expired || 0}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-blue">
                          <div className="performance-metric-label">Đã yêu cầu</div>
                          <div className="performance-metric-value performance-metric-value-blue">{warrantySummary.warranty_status.claimed || 0}</div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="performance-metrics-container">
                      <div className="performance-metrics-title">📋 Trạng thái yêu cầu</div>
                      <div className="performance-metrics-grid">
                        <div className="performance-metric-item performance-metric-item-orange">
                          <div className="performance-metric-label">Chờ xử lý</div>
                          <div className="performance-metric-value performance-metric-value-orange">{warrantySummary.claim_status?.pending || 0}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-blue">
                          <div className="performance-metric-label">Đang xử lý</div>
                          <div className="performance-metric-value performance-metric-value-blue">{warrantySummary.claim_status?.in_progress || 0}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-green">
                          <div className="performance-metric-label">Hoàn thành</div>
                          <div className="performance-metric-value performance-metric-value-green">{warrantySummary.claim_status?.completed || 0}</div>
                        </div>
                        <div className="performance-metric-item performance-metric-item-red">
                          <div className="performance-metric-label">Từ chối</div>
                          <div className="performance-metric-value performance-metric-value-red">{warrantySummary.claim_status?.rejected || 0}</div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Product Analysis Chart */}
              <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Top sản phẩm bảo hành</div>
                    <div style={{height: 250}}>
                      <Bar data={warrantyProductChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Chi tiết sản phẩm bảo hành</div>
                    <Table
                      dataSource={Array.isArray(warrantySummary?.product_analysis) ? warrantySummary.product_analysis : []}
                      columns={[
                        {
                          title: 'Sản phẩm',
                          dataIndex: 'product_name',
                          key: 'product_name',
                          render: (text, record) => (
                            <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
                              <div>
                                <div style={{fontWeight: 600}}>{text}</div>
                                <div style={{fontSize: 12, color: '#666'}}>{record.brand_name || 'N/A'}</div>
                              </div>
                            </AntTooltip>
                          ),
                        },
                        {
                          title: 'Bảo hành',
                          dataIndex: 'total_warranties',
                          key: 'total_warranties',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#1890ff'}}>{value || 0}</span>
                          ),
                        },
                        {
                          title: 'Yêu cầu',
                          dataIndex: 'total_claims',
                          key: 'total_claims',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#52c41a'}}>{value || 0}</span>
                          ),
                        },
                        {
                          title: 'Chi phí',
                          dataIndex: 'total_repair_cost',
                          key: 'total_repair_cost',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#fa8c16'}}>{formatVND(value || 0)}₫</span>
                          ),
                        },
                        {
                          title: 'Tỷ lệ',
                          dataIndex: 'claim_rate',
                          key: 'claim_rate',
                          render: (value) => (
                            <Tag color={value > 50 ? 'red' : value > 20 ? 'orange' : 'green'}>
                              {value.toFixed(1)}%
                            </Tag>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ y: 200 }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Claim Details Table */}
              {warrantySummary?.claim_details && warrantySummary.claim_details.length > 0 && (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <div className="dashboard-table-container">
                      <div className="dashboard-table-title">📋 Chi tiết yêu cầu bảo hành</div>
                      <Table
                        dataSource={warrantySummary.claim_details}
                        columns={[
                          {
                            title: 'ID Yêu cầu',
                            dataIndex: 'claim_id',
                            key: 'claim_id',
                            render: (value) => (
                              <span style={{fontWeight: 600, color: '#1890ff'}}>#{value}</span>
                            ),
                          },
                          {
                            title: 'Sản phẩm',
                            dataIndex: 'product_name',
                            key: 'product_name',
                            render: (text, record) => (
                              <div>
                                <div style={{fontWeight: 600}}>{text}</div>
                                <div style={{fontSize: 12, color: '#666'}}>{record.sku || 'N/A'}</div>
                              </div>
                            ),
                          },
                          {
                            title: 'Ngày yêu cầu',
                            dataIndex: 'claim_date',
                            key: 'claim_date',
                            render: (value) => (
                              <span style={{color: '#666'}}>{value || 'N/A'}</span>
                            ),
                          },
                          {
                            title: 'Ngày hoàn thành',
                            dataIndex: 'completed_date',
                            key: 'completed_date',
                            render: (value) => (
                              <span style={{color: value ? '#52c41a' : '#666'}}>{value || 'Chưa hoàn thành'}</span>
                            ),
                          },
                          {
                            title: 'Số ngày xử lý',
                            dataIndex: 'processing_days',
                            key: 'processing_days',
                            render: (value) => (
                              <span style={{fontWeight: 600, color: '#fa8c16'}}>{value || 0} ngày</span>
                            ),
                          },
                          {
                            title: 'Chi phí sửa chữa',
                            dataIndex: 'repair_cost',
                            key: 'repair_cost',
                            render: (value) => (
                              <span style={{fontWeight: 600, color: '#ff4d4f'}}>{formatVND(value || 0)}₫</span>
                            ),
                          },
                          {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (value) => {
                              const statusConfig = {
                                'PENDING': { color: 'orange', text: 'Chờ xử lý' },
                                'IN_PROGRESS': { color: 'blue', text: 'Đang xử lý' },
                                'COMPLETED': { color: 'green', text: 'Hoàn thành' },
                                'REJECTED': { color: 'red', text: 'Từ chối' }
                              };
                              const config = statusConfig[value] || { color: 'default', text: value };
                              return <Tag color={config.color}>{config.text}</Tag>;
                            },
                          },
                        ]}
                        pagination={false}
                        size="small"
                        scroll={{ x: 800, y: 300 }}
                      />
                    </div>
                  </Col>
                </Row>
              )}

              {/* Average Repair Cost Card */}
              {warrantySummary?.summary?.average_repair_cost && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24}>
                    <div className="performance-metrics-container">
                      <div className="performance-metrics-title">💰 Thống kê chi phí sửa chữa</div>
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <div style={{fontSize: '32px', fontWeight: 700, color: '#fa8c16', marginBottom: '8px'}}>
                          {formatVND(warrantySummary.summary.average_repair_cost || 0)}₫
                        </div>
                        <div style={{fontSize: '16px', color: '#666'}}>Chi phí sửa chữa trung bình</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )
        },


        {
          key: '8',
          label: 'Thống kê tổng hợp',
          children: (
            <>
              {comprehensiveAnalysis?.period && (
                <div className="comprehensive-period-badge">
                  <strong>📅 Kỳ báo cáo:</strong> {comprehensiveAnalysis.period.start_date} - {comprehensiveAnalysis.period.end_date}
                </div>
              )}
              <div className="comprehensive-row">
                {/* Tổng quan tài chính */}
                <div className="comprehensive-card">
                  <div className="comprehensive-title">💰 Tổng quan tài chính</div>
                  <div className="comprehensive-chart">
                    <Doughnut
                      data={{
                        labels: ['Doanh thu', 'Chiết khấu', 'Chi phí nhập', 'Tiền hoàn', 'Chi phí sửa', 'Lợi nhuận gộp', 'Lợi nhuận ròng'],
                        datasets: [{
                          data: [
                            comprehensiveAnalysis?.financial_summary?.total_revenue || 0,
                            comprehensiveAnalysis?.financial_summary?.total_discounts || 0,
                            comprehensiveAnalysis?.financial_summary?.total_purchase_cost || 0,
                            comprehensiveAnalysis?.financial_summary?.total_refund_amount || 0,
                            comprehensiveAnalysis?.financial_summary?.total_repair_cost || 0,
                            comprehensiveAnalysis?.financial_summary?.gross_profit || 0,
                            comprehensiveAnalysis?.financial_summary?.net_profit || 0
                          ],
                          backgroundColor: [
                            '#1890ff', '#faad14', '#13c2c2', '#ff4d4f', '#722ed1', '#52c41a', '#fa8c16'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        plugins: { legend: { display: true, position: 'bottom' } },
                        cutout: 60
                      }}
                    />
                  </div>
                  <div className="comprehensive-summary">
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng doanh thu:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.total_revenue || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Doanh thu ròng:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.net_revenue || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng chiết khấu:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.total_discounts || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng chi phí nhập:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.total_purchase_cost || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Lợi nhuận gộp:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.gross_profit || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tỷ suất LN gộp:</span><span className="comprehensive-value">{(comprehensiveAnalysis?.financial_summary?.gross_profit_margin || 0).toFixed(2)}%</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tiền hoàn:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.total_refund_amount || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Chi phí sửa chữa:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.total_repair_cost || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Lợi nhuận ròng:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.financial_summary?.net_profit || 0)}₫</span></div>
                  </div>
                </div>
                {/* Phân tích trả hàng */}
                <div className="comprehensive-card">
                  <div className="comprehensive-title">↩️ Phân tích trả hàng</div>
                  <div className="comprehensive-chart">
                    <Bar
                      data={{
                        labels: ['Đơn trả', 'SP trả', 'SL trả', 'Chờ duyệt', 'Đã duyệt', 'Hoàn thành', 'Từ chối'],
                        datasets: [{
                          label: 'Trả hàng',
                          data: [
                            comprehensiveAnalysis?.return_analysis?.total_return_orders || 0,
                            comprehensiveAnalysis?.return_analysis?.total_returned_items || 0,
                            comprehensiveAnalysis?.return_analysis?.total_returned_quantity || 0,
                            comprehensiveAnalysis?.return_analysis?.status_breakdown?.pending || 0,
                            comprehensiveAnalysis?.return_analysis?.status_breakdown?.approved || 0,
                            comprehensiveAnalysis?.return_analysis?.status_breakdown?.completed || 0,
                            comprehensiveAnalysis?.return_analysis?.status_breakdown?.rejected || 0
                          ],
                          backgroundColor: '#ff4d4f'
                        }]
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        indexAxis: 'y',
                        scales: { x: { beginAtZero: true } }
                      }}
                    />
                  </div>
                  <div className="comprehensive-summary">
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng đơn trả:</span><span className="comprehensive-value">{comprehensiveAnalysis?.return_analysis?.total_return_orders || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Sản phẩm trả:</span><span className="comprehensive-value">{comprehensiveAnalysis?.return_analysis?.total_returned_items || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Số lượng trả:</span><span className="comprehensive-value">{comprehensiveAnalysis?.return_analysis?.total_returned_quantity || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tiền hoàn:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.return_analysis?.total_refund_amount || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Hoàn TB:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.return_analysis?.average_refund_amount || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tỷ lệ trả:</span><span className="comprehensive-value">{(comprehensiveAnalysis?.return_analysis?.return_rate || 0).toFixed(2)}%</span></div>
                  </div>
                </div>
                {/* Phân tích bảo hành */}
                <div className="comprehensive-card">
                  <div className="comprehensive-title">🛠️ Phân tích bảo hành</div>
                  <div className="comprehensive-chart">
                    <Bar
                      data={{
                        labels: ['Tổng BH', 'Yêu cầu BH', 'Đang hoạt động', 'Đã claim', 'Hết hạn', 'Chờ xử lý', 'Hoàn thành'],
                        datasets: [{
                          label: 'Bảo hành',
                          data: [
                            comprehensiveAnalysis?.warranty_analysis?.total_warranties || 0,
                            comprehensiveAnalysis?.warranty_analysis?.total_warranty_claims || 0,
                            comprehensiveAnalysis?.warranty_analysis?.warranty_status?.active || 0,
                            comprehensiveAnalysis?.warranty_analysis?.warranty_status?.claimed || 0,
                            comprehensiveAnalysis?.warranty_analysis?.warranty_status?.expired || 0,
                            comprehensiveAnalysis?.warranty_analysis?.claim_status?.pending || 0,
                            comprehensiveAnalysis?.warranty_analysis?.claim_status?.completed || 0
                          ],
                          backgroundColor: '#1890ff'
                        }]
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        indexAxis: 'y',
                        scales: { x: { beginAtZero: true } }
                      }}
                    />
                  </div>
                  <div className="comprehensive-summary">
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng bảo hành:</span><span className="comprehensive-value">{comprehensiveAnalysis?.warranty_analysis?.total_warranties || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Yêu cầu bảo hành:</span><span className="comprehensive-value">{comprehensiveAnalysis?.warranty_analysis?.total_warranty_claims || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Chi phí sửa chữa:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.warranty_analysis?.total_repair_cost || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Chi phí TB:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.warranty_analysis?.average_repair_cost || 0)}₫</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tỷ lệ yêu cầu:</span><span className="comprehensive-value">{(comprehensiveAnalysis?.warranty_analysis?.claim_rate || 0).toFixed(2)}%</span></div>
                  </div>
                </div>
                {/* Chỉ số vận hành */}
                <div className="comprehensive-card">
                  <div className="comprehensive-title">📦 Chỉ số vận hành</div>
                  <div className="comprehensive-chart">
                    <Bar
                      data={{
                        labels: ['Đơn hàng', 'SP bán', 'SP nhập', 'Phiếu nhập'],
                        datasets: [{
                          label: 'Vận hành',
                          data: [
                            comprehensiveAnalysis?.operational_metrics?.total_orders || 0,
                            comprehensiveAnalysis?.operational_metrics?.total_items_sold || 0,
                            comprehensiveAnalysis?.operational_metrics?.total_items_purchased || 0,
                            comprehensiveAnalysis?.operational_metrics?.total_purchase_orders || 0
                          ],
                          backgroundColor: '#52c41a'
                        }]
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        indexAxis: 'y',
                        scales: { x: { beginAtZero: true } }
                      }}
                    />
                  </div>
                  <div className="comprehensive-summary">
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng đơn hàng:</span><span className="comprehensive-value">{comprehensiveAnalysis?.operational_metrics?.total_orders || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng SP bán:</span><span className="comprehensive-value">{comprehensiveAnalysis?.operational_metrics?.total_items_sold || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng SP nhập:</span><span className="comprehensive-value">{comprehensiveAnalysis?.operational_metrics?.total_items_purchased || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tổng phiếu nhập:</span><span className="comprehensive-value">{comprehensiveAnalysis?.operational_metrics?.total_purchase_orders || 0}</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Tỷ lệ trả:</span><span className="comprehensive-value">{(comprehensiveAnalysis?.operational_metrics?.return_rate || 0).toFixed(2)}%</span></div>
                    <div className="comprehensive-item"><span className="comprehensive-label">Giá trị TB đơn hàng:</span><span className="comprehensive-value">{formatVND(comprehensiveAnalysis?.operational_metrics?.average_order_value || 0)}₫</span></div>
                  </div>
                </div>
              </div>
              {/* Bảng phân tích lợi nhuận sản phẩm + Bar chart top sản phẩm LN */}
              <div className="product-profit-container">
                <div className="product-profit-header">
                  <div className="product-profit-title">
                    <span className="product-profit-icon">📊</span>
                    Phân tích lợi nhuận sản phẩm
                  </div>
                  <div className="product-profit-subtitle">
                    Top 10 sản phẩm có lợi nhuận cao nhất trong kỳ báo cáo
                  </div>
                </div>
                
                <div className="product-profit-content-stack">
                  {/* Card Biểu đồ Bar */}
                  <div className="product-profit-chart-card modern-shadow minimal">
                    <div className="product-profit-chart-title minimal">
                      <span className="product-profit-chart-icon">📈</span>
                      Biểu đồ lợi nhuận top sản phẩm
                    </div>
                    <div className="product-profit-chart-container">
                      <Bar
                        data={{
                          labels: (comprehensiveAnalysis?.product_profit_analysis || []).slice(0, 10).map(p => p.product_name),
                          datasets: [{
                            label: 'Lợi nhuận ròng',
                            data: (comprehensiveAnalysis?.product_profit_analysis || []).slice(0, 10).map(p => p.net_profit),
                            backgroundColor: '#4f8cff',
                            borderRadius: 6,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: true }
                          },
                          indexAxis: 'y',
                          scales: {
                            x: {
                              beginAtZero: true,
                              grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
                              ticks: {
                                color: getTextColor(),
                                font: { size: 13 },
                                callback: function(value) { return formatVND(value) + '₫'; }
                              }
                            },
                            y: {
                              grid: { display: false },
                              ticks: {
                                color: getTextColor(),
                                font: { size: 14 },
                                callback: function(value) { return value; }
                              }
                            }
                          }
                        }}
                        height={340}
                      />
                    </div>
                  </div>
                  {/* Table chi tiết */}
                  <div className="product-profit-table-card modern-shadow minimal">
                    <div className="product-profit-table-title minimal">
                      <span className="product-profit-table-icon">📋</span>
                      Chi tiết phân tích lợi nhuận
                    </div>
                    <div className="product-profit-table-container">
                      <Table
                        dataSource={Array.isArray(comprehensiveAnalysis?.product_profit_analysis) ? comprehensiveAnalysis.product_profit_analysis.slice(0, 10) : []}
                        columns={[
                          {
                            title: (
                              <span style={{display:'flex',alignItems:'center',gap:4}}>
                                <span style={{fontSize:16}}>📦</span>
                                <span style={{fontWeight:500}}>Sản phẩm</span>
                              </span>
                            ),
                            dataIndex: 'product_name',
                            key: 'product_name',
                            align: 'left',
                            width: 180,
                            render: (text, record, idx) => (
                              <div className="product-profit-product-info minimal">
                                <span className="product-profit-product-rank">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                </span>
                                <span className="product-profit-product-name" style={{whiteSpace:'normal',wordBreak:'break-word'}}>{text}</span>
                              </div>
                            )
                          },
                          {
                            title: <span>Đã bán</span>,
                            dataIndex: 'sold_quantity',
                            key: 'sold_quantity',
                            align: 'center',
                            width: 70,
                            render: (value) => <span>{value || 0}</span>
                          },
                          {
                            title: <span>Doanh thu</span>,
                            dataIndex: 'sold_revenue',
                            key: 'sold_revenue',
                            align: 'right',
                            width: 110,
                            render: (v) => <span style={{color:'#388e3c',fontWeight:600}}>{formatVND(v)}₫</span>
                          },
                          {
                            title: <span>Đã trả</span>,
                            dataIndex: 'returned_quantity',
                            key: 'returned_quantity',
                            align: 'center',
                            width: 70,
                            render: (value) => <span>{value || 0}</span>
                          },
                          {
                            title: <span>Tiền hoàn</span>,
                            dataIndex: 'refund_amount',
                            key: 'refund_amount',
                            align: 'right',
                            width: 110,
                            render: (v) => <span>{formatVND(v)}₫</span>
                          },
                          {
                            title: <span>Yêu cầu BH</span>,
                            dataIndex: 'warranty_claims',
                            key: 'warranty_claims',
                            align: 'center',
                            width: 90,
                            render: (value) => <span>{value || 0}</span>
                          },
                          {
                            title: <span>Chi phí sửa</span>,
                            dataIndex: 'repair_cost',
                            key: 'repair_cost',
                            align: 'right',
                            width: 110,
                            render: (v) => <span>{formatVND(v)}₫</span>
                          },
                          {
                            title: <span>Giá vốn</span>,
                            dataIndex: 'estimated_cost',
                            key: 'estimated_cost',
                            align: 'right',
                            width: 110,
                            render: (v) => <span>{formatVND(v)}₫</span>
                          },
                          {
                            title: <span>Lợi nhuận</span>,
                            dataIndex: 'net_profit',
                            key: 'net_profit',
                            align: 'right',
                            width: 110,
                            render: (v) => <span style={{color:'#388e3c',fontWeight:600}}>{formatVND(v)}₫</span>
                          },
                          {
                            title: <span>Tỷ suất</span>,
                            dataIndex: 'profit_margin',
                            key: 'profit_margin',
                            align: 'center',
                            width: 80,
                            render: (v) => <span>{(v || 0).toFixed(2)}%</span>
                          },
                        ]}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 'max-content', y: 400 }}
                        rowKey="product_variant_id"
                        className="product-profit-table minimal"
                        rowClassName={(record, index) => `product-profit-row minimal`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        },
        {
          key: '9',
          label: 'Top sản phẩm & khách hàng',
          children: (
            <>
              {/* Summary Cards cho Top Products */}
              {topProducts?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24}>
                    <div className="product-performance-filters-container">
                      <div className="product-performance-period-badge">
                        <strong>📊 Thống kê Top Sản phẩm:</strong> {topProducts.summary.period_days} ngày gần đây
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {topProducts?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📦</div>
                      <div className="sales-performance-label">Tổng sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-blue">{topProducts.summary.total_products || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🛒</div>
                      <div className="sales-performance-label">Tổng số lượng bán</div>
                      <div className="sales-performance-value sales-performance-value-green">{topProducts.summary.total_sold || 0}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">💰</div>
                      <div className="sales-performance-label">Tổng doanh thu</div>
                      <div className="sales-performance-value sales-performance-value-orange sales-performance-value-small">{formatVND(topProducts.summary.total_revenue || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📋</div>
                      <div className="sales-performance-label">Tổng đơn hàng</div>
                      <div className="sales-performance-value sales-performance-value-purple">{topProducts.summary.total_orders || 0}</div>
                    </div>
                  </Col>
                </Row>
              )}

              {topProducts?.summary && (
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📊</div>
                      <div className="sales-performance-label">DT TB/sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-blue sales-performance-value-small">{formatVND(topProducts.summary.average_revenue_per_product || 0)}₫</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">📈</div>
                      <div className="sales-performance-label">SL TB/sản phẩm</div>
                      <div className="sales-performance-value sales-performance-value-green">{(topProducts.summary.average_sold_per_product || 0).toFixed(1)}</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">🎯</div>
                      <div className="sales-performance-label">Hiệu suất bán hàng</div>
                      <div className="sales-performance-value sales-performance-value-orange">
                        {topProducts.summary.average_sold_per_product > 50 ? 'Tốt' : 
                         topProducts.summary.average_sold_per_product > 20 ? 'Trung bình' : 'Cần cải thiện'}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="sales-performance-card">
                      <div className="sales-performance-icon">⚡</div>
                      <div className="sales-performance-label">Tốc độ bán</div>
                      <div className="sales-performance-value sales-performance-value-purple">
                        {topProducts.summary.average_sold_per_product > 30 ? 'Nhanh' : 
                         topProducts.summary.average_sold_per_product > 10 ? 'Trung bình' : 'Chậm'}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Charts */}
              <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Top sản phẩm bán chạy</div>
                    <div style={{height: 250}}>
                      <Bar data={topProductsChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Top khách hàng chi tiêu</div>
                    <div style={{height: 250}}>
                      <Bar data={topCustomersChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Tables */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Bảng top sản phẩm</div>
                    <Table
                      dataSource={Array.isArray(topProducts?.top_products) ? topProducts.top_products : []}
                      columns={[
                        {
                          title: 'Sản phẩm',
                          dataIndex: 'product_name',
                          key: 'product_name',
                          render: (text, record) => (
                            <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
                              <div>
                                <div style={{fontWeight: 600}}>{text}</div>
                                <div style={{fontSize: 12, color: '#666'}}>
                                  {record.brand_name || 'N/A'} • {record.category_name || 'N/A'}
                                </div>
                              </div>
                            </AntTooltip>
                          ),
                        },
                        {
                          title: 'Số lượng bán',
                          dataIndex: 'total_sold',
                          key: 'total_sold',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#1890ff'}}>{value || 0}</span>
                          ),
                        },
                        {
                          title: 'Doanh thu',
                          dataIndex: 'total_revenue',
                          key: 'total_revenue',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#52c41a'}}>
                              {formatVND(value || 0)}₫
                            </span>
                          ),
                        },
                        {
                          title: 'Đơn hàng',
                          dataIndex: 'order_count',
                          key: 'order_count',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#fa8c16'}}>{value || 0}</span>
                          ),
                        },
                        {
                          title: 'Giá TB',
                          dataIndex: 'avg_price',
                          key: 'avg_price',
                          render: (value) => (
                            <span style={{fontSize: 12, color: '#666'}}>
                              {formatVND(value || 0)}₫
                            </span>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Bảng top khách hàng</div>
                    <Table
                      dataSource={Array.isArray(topCustomers) ? topCustomers : []}
                      columns={[
                        {
                          title: 'Khách hàng',
                          dataIndex: 'customer_name',
                          key: 'customer_name',
                          render: (text, record) => (
                            <div>
                              <div style={{fontWeight: 600}}>{`${record.first_name || ''} ${record.last_name || ''}`}</div>
                              <div style={{fontSize: 12, color: '#666'}}>{record.phone || 'N/A'}</div>
                            </div>
                          ),
                        },
                        {
                          title: 'Tổng chi tiêu',
                          dataIndex: 'total_spent',
                          key: 'total_spent',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#52c41a'}}>
                              {formatVND(value || 0)}₫
                            </span>
                          ),
                        },
                        {
                          title: 'Số đơn hàng',
                          dataIndex: 'total_orders',
                          key: 'total_orders',
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#fa8c16'}}>{value || 0}</span>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </div>
                </Col>
              </Row>
            </>
          )
        },
        {
          key: '10',
          label: 'Sản phẩm bán chạy nhất',
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                  <div className="dashboard-table-title">Top sản phẩm bán chạy nhất</div>
                  <div style={{height: 250}}>
                    <Bar data={bestSellingChartData} options={chartOptions} />
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="dashboard-table-container">
                  <div className="dashboard-table-title">Bảng sản phẩm bán chạy nhất</div>
                  <Table
                    dataSource={Array.isArray(bestSelling) ? bestSelling : []}
                    columns={[
                      {
                        title: 'Sản phẩm',
                        dataIndex: 'product_name',
                        key: 'product_name',
                        render: (text, record) => (
                          <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
                            <div>
                              <div style={{fontWeight: 600}}>{text}</div>
                              <div style={{fontSize: 12, color: '#666'}}>{record.brand_name || 'N/A'}</div>
                            </div>
                          </AntTooltip>
                        ),
                      },
                      {
                        title: 'Danh mục',
                        dataIndex: 'category_name',
                        key: 'category_name',
                        render: (value) => (
                          <Tag color="blue">{value || 'N/A'}</Tag>
                        ),
                      },
                      {
                        title: 'Số đơn hàng',
                        dataIndex: 'total_orders',
                        key: 'total_orders',
                        render: (value) => formatVND(value || 0),
                      },
                      {
                        title: 'Số lượng bán',
                        dataIndex: 'total_quantity',
                        key: 'total_quantity',
                        render: (value) => formatVND(value || 0),
                      },
                      {
                        title: 'Doanh thu',
                        dataIndex: 'total_revenue',
                        key: 'total_revenue',
                        render: (value) => (
                          <span style={{fontWeight: 600, color: '#52c41a'}}>
                            {formatVND(value || 0)}₫
                          </span>
                        ),
                      },
                    ]}
                    pagination={false}
                    size="small"
                    scroll={{ y: 200 }}
                  />
                </div>
              </Col>
            </Row>
          )
        }
      ]}
    />
  );
};

export default DashboardTabs; 