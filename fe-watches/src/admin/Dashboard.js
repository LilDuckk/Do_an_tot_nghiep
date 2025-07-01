import React from 'react';
import './static/AdminLayout.css';
import './static/Admin.css';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { REPORT_ENDPOINTS, PRODUCT_ENDPOINTS } from '../config/api';
import { 
  DatePicker, 
  Select, 
  Row, 
  Col, 
  Table, 
  message, 
  Spin, 
  Progress, 
  Tag, 
  Tabs,
  Tooltip as AntTooltip,
  Badge,
  Popover,
  Button
} from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  BarChartOutlined,
  RiseOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  InboxOutlined
} from '@ant-design/icons';
import './static/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);





export default function Dashboard() {
  // Bộ lọc
  const [period, setPeriod] = useState(30);
  const [storeId] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [profit, setProfit] = useState(null);
  const [bestSellers, setBestSellers] = useState(null);
  const [turnover, setTurnover] = useState(null);
  
  // Thêm state mới cho product performance
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [products, setProducts] = useState([]);
  const [performancePeriod, setPerformancePeriod] = useState('daily');
  const [alertsVisible, setAlertsVisible] = useState(false);

  // Fetch tổng quan dashboard
  const fetchOverview = useCallback(async () => {
    try {
      let url = `${REPORT_ENDPOINTS.DASHBOARD_OVERVIEW}?period=${period}`;
      if (storeId) url += `&store_id=${storeId}`;
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000) // Timeout 10s
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setOverview(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải tổng quan dashboard'); 
      }
    }
  }, [period, storeId]);

  // Fetch danh sách sản phẩm cho dropdown
  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000) // Timeout 8s
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setProducts(data.results || []);
    } catch (e) { 
      if (e.name !== 'AbortError') {
        console.error('Lỗi tải danh sách sản phẩm:', e); 
      }
    }
  }, []);

  // Fetch product performance
  const fetchProductPerformance = useCallback(async () => {
    if (!selectedProduct) return;
    
    try {
      let url = `${REPORT_ENDPOINTS.SALES_PRODUCT_PERFORMANCE}?product_id=${selectedProduct}&period=${performancePeriod}`;
      if (dateRange && dateRange.length === 2) {
        url += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) url += `&store_id=${storeId}`;
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setProductPerformance(await res.json());
    } catch (e) { message.error('Lỗi tải hiệu suất sản phẩm'); }
  }, [selectedProduct, performancePeriod, dateRange, storeId]);

  // Fetch các bảng biểu khác
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch tất cả API song song để tăng tốc độ
      const promises = [];
      
      // Alerts
      let urlAlert = `${REPORT_ENDPOINTS.DASHBOARD_ALERTS}`;
      if (storeId) urlAlert += `?store_id=${storeId}`;
      promises.push(fetch(urlAlert, { headers: { Authorization: `Bearer ${token}` } }));

      // Revenue daily
      let urlDaily = `${REPORT_ENDPOINTS.REVENUE_DAILY}`;
      if (dateRange && dateRange.length === 2) {
        urlDaily += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDaily += `&store_id=${storeId}`;
      } else {
        urlDaily += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlDaily, { headers: { Authorization: `Bearer ${token}` } }));

      // Revenue monthly
      let urlMonthly = `${REPORT_ENDPOINTS.REVENUE_MONTHLY}`;
      if (storeId) urlMonthly += `?store_id=${storeId}`;
      promises.push(fetch(urlMonthly, { headers: { Authorization: `Bearer ${token}` } }));

      // Profit analysis
      let urlProfit = `${REPORT_ENDPOINTS.PROFIT_ANALYSIS}`;
      if (dateRange && dateRange.length === 2) {
        urlProfit += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlProfit += `&store_id=${storeId}`;
      } else {
        urlProfit += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlProfit, { headers: { Authorization: `Bearer ${token}` } }));

      // Best sellers
      let urlBest = `${REPORT_ENDPOINTS.SALES_BEST_SELLERS}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlBest += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlBest += `&store_id=${storeId}`;
      } else {
        urlBest += `&store_id=${storeId}`;
      }
      promises.push(fetch(urlBest, { headers: { Authorization: `Bearer ${token}` } }));

      // Inventory turnover
      let urlTurn = `${REPORT_ENDPOINTS.SALES_INVENTORY_TURNOVER}?limit=10`;
      if (storeId) urlTurn += `&store_id=${storeId}`;
      promises.push(fetch(urlTurn, { headers: { Authorization: `Bearer ${token}` } }));

      // Chờ tất cả API hoàn thành
      const responses = await Promise.all(promises);
      const [resAlert, resDaily, resMonthly, resProfit, resBest, resTurn] = responses;
      
      setAlerts(await resAlert.json());
      setDailyRevenue(await resDaily.json());
      setMonthlyRevenue(await resMonthly.json());
      setProfit(await resProfit.json());
      setBestSellers(await resBest.json());
      setTurnover(await resTurn.json());
    } catch (e) { message.error('Lỗi tải dữ liệu báo cáo'); }
    setLoading(false);
  }, [storeId, dateRange]);

  useEffect(() => { 
    const initializeData = async () => {
      setInitialLoading(true);
      setDataReady(false);
      try {
        // Load overview và products song song
        await Promise.all([fetchOverview(), fetchProducts()]);
        // Sau đó load các dữ liệu khác
        await fetchAll();
        // Đánh dấu dữ liệu đã sẵn sàng
        setDataReady(true);
      } catch (error) {
        console.error('Lỗi khởi tạo dashboard:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    initializeData();
  }, [fetchOverview, fetchProducts, fetchAll]);
  
  useEffect(() => {
    if (!initialLoading) {
      fetchProductPerformance();
    }
  }, [fetchProductPerformance, initialLoading]);

  // Danh sách kỳ lọc
  const periodOptions = [7, 30, 90, 365];

  // Chart data helpers
  const dailyLabels = dailyRevenue?.daily_data?.map(d => d.date) || [];
  const dailyGross = dailyRevenue?.daily_data?.map(d => d.gross_revenue) || [];
  const dailyNet = dailyRevenue?.daily_data?.map(d => d.net_revenue) || [];

  const monthlyLabels = monthlyRevenue?.monthly_data?.map(m => m.month_name) || [];
  const monthlyGross = monthlyRevenue?.monthly_data?.map(m => m.gross_revenue) || [];
  const monthlyNet = monthlyRevenue?.monthly_data?.map(m => m.net_revenue) || [];

  const bestSellerLabels = bestSellers?.best_sellers?.map(p => p.product_name) || [];
  const bestSellerQty = bestSellers?.best_sellers?.map(p => p.total_quantity) || [];

  const turnoverLabels = turnover?.inventory_turnover?.map(p => p.product_name) || [];
  const turnoverRates = turnover?.inventory_turnover?.map(p => p.turnover_rate) || [];

  // Product performance data
  const performanceLabels = productPerformance?.performance_data?.map(p => p.period) || [];
  const performanceQty = productPerformance?.performance_data?.map(p => p.quantity_sold) || [];
  const performanceRevenue = productPerformance?.performance_data?.map(p => p.revenue) || [];

  // Chart configurations
  const revenueChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Doanh thu gốc',
        data: dailyGross,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Doanh thu thực',
        data: dailyNet,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Doanh thu gốc',
        data: monthlyGross,
        backgroundColor: 'rgba(24, 144, 255, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Doanh thu thực',
        data: monthlyNet,
        backgroundColor: 'rgba(82, 196, 26, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const bestSellersChartData = {
    labels: bestSellerLabels.slice(0, 5),
    datasets: [
      {
        label: 'Số lượng bán',
        data: bestSellerQty.slice(0, 5),
        backgroundColor: [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#f5222d',
          '#722ed1'
        ],
        borderRadius: 8,
      }
    ]
  };

  const profitDistributionData = {
    labels: ['Lãi gộp', 'Vốn hàng bán'],
    datasets: [{
      data: [
        profit?.profit?.gross_profit || 0,
        profit?.costs?.cost_of_goods_sold || 0
      ],
      backgroundColor: ['#52c41a', '#ff4d4f'],
      borderWidth: 0,
      cutout: '60%',
    }]
  };

  const turnoverChartData = {
    labels: turnoverLabels.slice(0, 8),
    datasets: [{
      label: 'Tỷ lệ luân chuyển',
      data: turnoverRates.slice(0, 8),
      backgroundColor: 'rgba(114, 46, 209, 0.8)',
      borderRadius: 6,
    }]
  };

  const productPerformanceChartData = {
    labels: performanceLabels,
    datasets: [
      {
        label: 'Số lượng bán',
        data: performanceQty,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Doanh thu',
        data: performanceRevenue,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const productPerformanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Thêm hàm format tiền Việt Nam
  const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 1 }).format(value);

  // Table columns cho best sellers
  const bestSellersColumns = [
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
      title: 'Số lượng bán',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      render: (value) => (
        <Tag color="blue">{formatVND(value)}</Tag>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      sorter: (a, b) => a.total_revenue - b.total_revenue,
      render: (value) => (
        <span style={{fontWeight: 600, color: '#52c41a'}}>
          {formatVND(value)}₫
        </span>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'total_discount',
      key: 'total_discount',
      render: (value) => (
        <span style={{color: '#faad14'}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (value, record) => (
        <div>
          <div>{formatVND(value || 0)}</div>
          <Progress 
            percent={Math.min(((value || 0) / (record.max_stock || 1)) * 100, 100)} 
            size="small" 
            showInfo={false}
            strokeColor={value < 10 ? '#ff4d4f' : value < 50 ? '#faad14' : '#52c41a'}
          />
        </div>
      ),
    },
    {
      title: 'Lãi gộp',
      dataIndex: 'gross_profit',
      key: 'gross_profit',
      render: (value) => (
        <span style={{fontWeight: 600, color: '#722ed1'}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
  ];

  // Table columns cho inventory turnover
  const turnoverColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
          <div>
            <div style={{fontWeight: 600}}>{text}</div>
            <div style={{fontSize: 12, color: '#666'}}>{record.category_name || 'N/A'}</div>
          </div>
        </AntTooltip>
      ),
    },
    {
      title: 'Tỷ lệ luân chuyển',
      dataIndex: 'turnover_rate',
      key: 'turnover_rate',
      sorter: (a, b) => a.turnover_rate - b.turnover_rate,
      render: (value) => (
        <Tag color={value > 5 ? 'green' : value > 2 ? 'orange' : 'red'}>
          {value.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity_sold',
      key: 'quantity_sold',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Ngày tồn kho',
      dataIndex: 'days_of_inventory',
      key: 'days_of_inventory',
      render: (value) => (
        <Tag color={value < 30 ? 'green' : value < 90 ? 'orange' : 'red'}>
          {value || 0} ngày
        </Tag>
      ),
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'stock_value',
      key: 'stock_value',
      render: (value) => (
        <span style={{fontWeight: 600}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
  ];

  // Mini statistics cards data
  const miniStats = [
    {
      title: 'Tổng đơn hàng',
      value: dailyRevenue?.summary?.total_orders || 0,
      suffix: 'đơn',
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      growth: dailyRevenue?.summary?.orders_growth || 0,
    },
    {
      title: 'Tổng khách hàng',
      value: dailyRevenue?.summary?.total_customers || 0,
      suffix: 'khách',
      icon: <UserOutlined />,
      color: '#52c41a',
      growth: dailyRevenue?.summary?.customers_growth || 0,
    },
    {
      title: 'AOV (Giá trị đơn trung bình)',
      value: dailyRevenue?.summary?.average_order_value || 0,
      suffix: '₫',
      icon: <DollarOutlined />,
      color: '#faad14',
      growth: dailyRevenue?.summary?.aov_growth || 0,
    },
    {
      title: 'Tỷ lệ giảm giá',
      value: dailyRevenue?.summary?.discount_rate || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#722ed1',
      growth: dailyRevenue?.summary?.discount_growth || 0,
    },
  ];

  // Profit analysis cards
  const profitStats = [
    {
      title: 'Lãi gộp',
      value: profit?.profit?.gross_profit || 0,
      suffix: '₫',
      icon: <ArrowUpOutlined />,
      color: '#52c41a',
      percentage: profit?.profit?.gross_profit_margin || 0,
    },
    {
      title: 'Tỷ suất lãi gộp',
      value: profit?.profit?.gross_profit_margin || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Lãi/đơn hàng',
      value: profit?.profit?.profit_per_order || 0,
      suffix: '₫',
      icon: <ShoppingOutlined />,
      color: '#faad14',
    },
    {
      title: 'Chi phí hàng bán',
      value: profit?.costs?.cost_of_goods_sold || 0,
      suffix: '₫',
      icon: <InboxOutlined />,
      color: '#ff4d4f',
      percentage: profit?.costs?.cost_percentage || 0,
    },
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Loading overlay chỉ cho container chính */}
      {(loading || initialLoading) && (
        <div className="dashboard-loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner" />
            <div className="loading-text">
              {initialLoading ? 'Đang khởi tạo dashboard...' : 'Đang tải dữ liệu...'}
            </div>
            {initialLoading && (
              <div className="loading-subtext">
                Vui lòng chờ trong giây lát
              </div>
            )}
            <div className="loading-progress-bar">
              <div className="loading-progress-fill" />
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Dashboard Analytics
        </h1>
        <p className="dashboard-subtitle">
          Tổng quan hoạt động kinh doanh và thống kê chi tiết
        </p>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filters-container">
          <div className="filter-item">
            <label className="filter-label">Kỳ báo cáo</label>
            <Select
              value={period}
              onChange={setPeriod}
              className="filter-select"
              options={periodOptions.map(p => ({ value: p, label: `${p} ngày` }))}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">Khoảng thời gian</label>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="filter-date-picker"
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Alerts Button */}
      {alerts?.alerts && alerts.alerts.length > 0 && (
        <div className="alerts-button-container">
          <Popover
            content={
              <div className="alerts-popover-content">
                <div className="alerts-popover-header">
                  <AlertOutlined className="alerts-icon" />
                  Cảnh báo hệ thống ({alerts.alerts.length})
                </div>
                <div className="alerts-list">
                  {alerts.alerts.map((alert, index) => (
                    <div key={index} className={`alert-item alert-level-${alert.level}`}>
                      <div className="alert-title">
                        {alert.title || 'Cảnh báo'}
                      </div>
                      <div className="alert-message">
                        {alert.message}
                      </div>
                      {alert.action_url && (
                        <Button 
                          type="link" 
                          size="small" 
                          className="alert-action-btn"
                          onClick={() => window.open(alert.action_url, '_blank')}
                        >
                          Xem chi tiết →
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            }
            title={null}
            trigger="click"
            placement="leftBottom"
            overlayStyle={{zIndex: 1001}}
            onOpenChange={setAlertsVisible}
          >
            <Badge count={alerts.alerts.length} size="small">
              <Button
                type="primary"
                danger
                shape="circle"
                size="large"
                icon={<AlertOutlined />}
                className={`alerts-button ${alertsVisible ? 'alerts-button-active' : ''}`}
              />
            </Badge>
          </Popover>
          <div className="alerts-label">
            Cảnh báo
          </div>
        </div>
      )}

      {/* KPI Cards - 2 card/row */}
      {dataReady && (
        <Row gutter={[16, 16]} className="kpi-cards-row">
          <Col xs={24} sm={12} lg={12}>
            <div className="kpi-card">
              <div className="kpi-card-content">
                <div className="kpi-card-left">
                  <div className="kpi-title">Doanh thu gốc</div>
                  <div className="kpi-value kpi-value-blue">
                    {formatVND(overview?.revenue?.gross_revenue || 0)}
                    <span className="kpi-suffix"> ₫</span>
                  </div>
                  <div className="kpi-growth kpi-growth-positive">
                    <RiseOutlined /> +{overview?.revenue?.revenue_growth || 0}%
                  </div>
                </div>
                <div className="kpi-card-icon kpi-icon-blue">
                  <DollarOutlined />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <div className="kpi-card">
              <div className="kpi-card-content">
                <div className="kpi-card-left">
                  <div className="kpi-title">Doanh thu thực</div>
                  <div className="kpi-value kpi-value-green">
                    {formatVND(overview?.revenue?.net_revenue || 0)}
                    <span className="kpi-suffix"> ₫</span>
                  </div>
                  <div className="kpi-subtitle">
                    Giảm giá: {formatVND(overview?.revenue?.total_discounts || 0)}₫
                  </div>
                </div>
                <div className="kpi-card-icon kpi-icon-green">
                  <BarChartOutlined />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {dataReady && (
        <Row gutter={[16, 16]} className="kpi-cards-row kpi-cards-row-second">
          <Col xs={24} sm={12} lg={12}>
            <div className="kpi-card">
              <div className="kpi-card-content">
                <div className="kpi-card-left">
                  <div className="kpi-title">Tổng đơn hàng</div>
                  <div className="kpi-value kpi-value-orange">
                    {formatVND(overview?.orders?.total_orders || 0)}
                  </div>
                  <div className="kpi-subtitle">
                    {overview?.orders?.orders_per_customer || 0} đơn/khách
                  </div>
                </div>
                <div className="kpi-card-icon kpi-icon-orange">
                  <ShoppingCartOutlined />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <div className="kpi-card">
              <div className="kpi-card-content">
                <div className="kpi-card-left">
                  <div className="kpi-title">Khách hàng</div>
                  <div className="kpi-value kpi-value-purple">
                    {formatVND(overview?.orders?.total_customers || 0)}
                  </div>
                  <div className="kpi-subtitle">
                    {overview?.products?.total_items_sold || 0} sản phẩm bán
                  </div>
                </div>
                <div className="kpi-card-icon kpi-icon-purple">
                  <UserOutlined />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Mini Statistics Cards */}
      {dataReady && (
        <div className="dashboard-chart-container mini-stats-container">
          <div className="dashboard-table-title">Thống kê chi tiết doanh thu</div>
          <Row gutter={[16, 16]}>
            {miniStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="mini-stat-card">
                  <div className="mini-stat-title">
                    {stat.title}
                  </div>
                  <div className="mini-stat-value" style={{color: stat.color}}>
                    {formatVND(stat.value)}{stat.suffix}
                  </div>
                  {stat.growth !== undefined && (
                    <div className={`mini-stat-growth ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                      {stat.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(stat.growth)}%
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Profit Analysis Cards */}
      {dataReady && (
        <div className="dashboard-chart-container profit-stats-container">
          <div className="dashboard-table-title">Phân tích lợi nhuận</div>
          <Row gutter={[16, 16]}>
            {profitStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="profit-stat-card">
                  <div className="profit-stat-title">
                    {stat.title}
                  </div>
                  <div className="profit-stat-value" style={{color: stat.color}}>
                    {formatVND(stat.value)}{stat.suffix}
                  </div>
                  {stat.percentage !== undefined && (
                    <div className="profit-stat-percentage">
                      {stat.percentage}% tổng doanh thu
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Tabs cho các biểu đồ và bảng */}
      {dataReady && (
        <Tabs 
          defaultActiveKey="1" 
          className="dashboard-tabs"
          items={[
          {
            key: '1',
            label: 'Biểu đồ doanh thu',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={24}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Biểu đồ doanh thu theo ngày</div>
                    <div style={{height: 300}}>
                      <Line data={revenueChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={24}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Doanh thu theo tháng</div>
                    <div style={{height: 250}}>
                      <Bar data={monthlyChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
              </Row>
            )
          },
          {
            key: '2',
            label: 'Hiệu suất sản phẩm',
            children: (
              <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                <div className="dashboard-table-title">Hiệu suất sản phẩm theo thời gian</div>
                <div style={{marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Chọn sản phẩm</label>
                    <Select
                      showSearch
                      placeholder="Tìm và chọn sản phẩm"
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      style={{ minWidth: 300 }}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      options={products.map(p => ({ value: p.id, label: p.name }))}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Kỳ báo cáo</label>
                    <Select
                      value={performancePeriod}
                      onChange={setPerformancePeriod}
                      style={{ minWidth: 120 }}
                      options={[
                        { value: 'daily', label: 'Theo ngày' },
                        { value: 'weekly', label: 'Theo tuần' },
                        { value: 'monthly', label: 'Theo tháng' }
                      ]}
                    />
                  </div>
                </div>
                {selectedProduct && (
                  <div style={{height: 300}}>
                    <Line data={productPerformanceChartData} options={productPerformanceChartOptions} />
                  </div>
                )}
                {!selectedProduct && (
                  <div style={{textAlign: 'center', padding: 40, color: '#666'}}>
                    Vui lòng chọn sản phẩm để xem hiệu suất
                  </div>
                )}
              </div>
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
                      dataSource={bestSellers?.best_sellers || []}
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
                      dataSource={turnover?.inventory_turnover || []}
                      columns={turnoverColumns}
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
            key: '5',
            label: 'Phân tích lợi nhuận',
            children: (
              <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                <div className="dashboard-table-title">Phân bố lợi nhuận</div>
                <div style={{height: 300, display: 'flex', justifyContent: 'center'}}>
                  <div style={{width: 300}}>
                    <Doughnut data={profitDistributionData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )
          }
        ]}
        />
      )}

    </div>
  );
} 