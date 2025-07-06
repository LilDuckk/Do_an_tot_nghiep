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
  const [period, setPeriod] = useState('today');
  const [storeId, setStoreId] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  
  // Dashboard data
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [alerts, setAlerts] = useState(null);
  
  // Sales Analysis data
  const [bestSellers, setBestSellers] = useState(null);
  const [salesPerformance, setSalesPerformance] = useState(null);
  const [inventoryTurnover, setInventoryTurnover] = useState(null);
  
  // Revenue data
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [profitAnalysis, setProfitAnalysis] = useState(null);
  
  // Return & Warranty data
  const [returnSummary, setReturnSummary] = useState(null);
  const [warrantySummary, setWarrantySummary] = useState(null);
  const [financialImpact, setFinancialImpact] = useState(null);
  
  // Daily Revenue data
  const [dailyRevenueData, setDailyRevenueData] = useState(null);
  const [inventoryAnalysis, setInventoryAnalysis] = useState(null);
  const [revenueForecast, setRevenueForecast] = useState(null);
  
  // Top Performance data
  const [topProducts, setTopProducts] = useState(null);
  const [topCustomers, setTopCustomers] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);
  
  // Product performance
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [products, setProducts] = useState([]);
  const [performancePeriod, setPerformancePeriod] = useState('daily');
  const [productsLoading, setProductsLoading] = useState(false);
  const [alertsVisible, setAlertsVisible] = useState(false);

  // Fetch dashboard overview
  const fetchOverview = useCallback(async () => {
    try {
      let url = `${REPORT_ENDPOINTS.DASHBOARD_OVERVIEW}?period=${period}`;
      if (storeId) url += `&store_id=${storeId}`;
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setOverview(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải tổng quan dashboard'); 
      }
    }
  }, [period, storeId]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    try {
      let url = `${REPORT_ENDPOINTS.DASHBOARD_RECENT_ACTIVITY}?limit=10`;
      if (storeId) url += `&store_id=${storeId}`;
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setRecentActivity(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải hoạt động gần đây'); 
      }
    }
  }, [storeId]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      let url = `${REPORT_ENDPOINTS.DASHBOARD_ALERTS}`;
      if (storeId) url += `?store_id=${storeId}`;
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setAlerts(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải cảnh báo'); 
      }
    }
  }, [storeId]);

  // Fetch products list for dropdown
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try PRODUCTS endpoint first
      let res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS}?page_size=1000&search=`, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      });
      
      // If not successful, try PRODUCTS_LIST_ALL
      if (!res.ok) {
        console.log('Trying PRODUCTS_LIST_ALL endpoint...');
        res = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL, { 
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(8000)
        });
      }
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Handle different data structures from API
      let productsList = [];
      if (data.results) {
        productsList = data.results;
      } else if (Array.isArray(data)) {
        productsList = data;
      } else if (data.products) {
        productsList = data.products;
      } else if (data.data) {
        productsList = data.data;
      }
      
      setProducts(productsList);
    } catch (e) { 
      if (e.name !== 'AbortError') {
        console.error('Error loading products:', e); 
        message.error('Lỗi tải danh sách sản phẩm');
      }
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch product performance
  const fetchProductPerformance = useCallback(async () => {
    if (!selectedProduct) return;
    
    try {
      let url = `${REPORT_ENDPOINTS.SALES_PERFORMANCE_BY_TIME}?product_variant_id=${selectedProduct}&period_type=${performancePeriod}`;
      if (dateRange && dateRange.length === 2) {
        url += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) url += `&store_id=${storeId}`;
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Network response was not ok');
      setProductPerformance(await res.json());
    } catch (e) { 
      message.error('Lỗi tải hiệu suất sản phẩm'); 
    }
  }, [selectedProduct, performancePeriod, dateRange, storeId]);



  // Fetch all report data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch all APIs in parallel for better performance
      const promises = [];
      
      // Sales Analysis
      let urlBestSellers = `${REPORT_ENDPOINTS.SALES_BEST_SELLERS}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlBestSellers += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) urlBestSellers += `&store_id=${storeId}`;
      promises.push(fetch(urlBestSellers, { headers: { Authorization: `Bearer ${token}` } }));

      let urlInventoryTurnover = `${REPORT_ENDPOINTS.SALES_INVENTORY_TURNOVER}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlInventoryTurnover += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) urlInventoryTurnover += `&store_id=${storeId}`;
      promises.push(fetch(urlInventoryTurnover, { headers: { Authorization: `Bearer ${token}` } }));

      // Revenue Reports
      let urlDailyRevenue = `${REPORT_ENDPOINTS.REVENUE_DAILY}`;
      if (dateRange && dateRange.length === 2) {
        urlDailyRevenue += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDailyRevenue += `&store_id=${storeId}`;
      } else if (storeId) {
        urlDailyRevenue += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlDailyRevenue, { headers: { Authorization: `Bearer ${token}` } }));

      let urlMonthlyRevenue = `${REPORT_ENDPOINTS.REVENUE_MONTHLY}`;
      if (storeId) urlMonthlyRevenue += `?store_id=${storeId}`;
      promises.push(fetch(urlMonthlyRevenue, { headers: { Authorization: `Bearer ${token}` } }));

      let urlProfitAnalysis = `${REPORT_ENDPOINTS.REVENUE_PROFIT_ANALYSIS}`;
      if (dateRange && dateRange.length === 2) {
        urlProfitAnalysis += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlProfitAnalysis += `&store_id=${storeId}`;
      } else if (storeId) {
        urlProfitAnalysis += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlProfitAnalysis, { headers: { Authorization: `Bearer ${token}` } }));

      // Return & Warranty Reports
      let urlReturnSummary = `${REPORT_ENDPOINTS.RETURN_SUMMARY}`;
      if (dateRange && dateRange.length === 2) {
        urlReturnSummary += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlReturnSummary += `&store_id=${storeId}`;
      } else if (storeId) {
        urlReturnSummary += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlReturnSummary, { headers: { Authorization: `Bearer ${token}` } }));

      let urlWarrantySummary = `${REPORT_ENDPOINTS.WARRANTY_SUMMARY}`;
      if (dateRange && dateRange.length === 2) {
        urlWarrantySummary += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlWarrantySummary += `&store_id=${storeId}`;
      } else if (storeId) {
        urlWarrantySummary += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlWarrantySummary, { headers: { Authorization: `Bearer ${token}` } }));

      let urlFinancialImpact = `${REPORT_ENDPOINTS.FINANCIAL_IMPACT}`;
      if (dateRange && dateRange.length === 2) {
        urlFinancialImpact += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlFinancialImpact += `&store_id=${storeId}`;
      } else if (storeId) {
        urlFinancialImpact += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlFinancialImpact, { headers: { Authorization: `Bearer ${token}` } }));

      // Daily Revenue
      let urlDailyRevenueData = `${REPORT_ENDPOINTS.DAILY_REVENUE_CALCULATE}`;
      if (dateRange && dateRange.length === 2) {
        urlDailyRevenueData += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDailyRevenueData += `&store=${storeId}`;
      } else if (storeId) {
        urlDailyRevenueData += `?store=${storeId}`;
      }
      promises.push(fetch(urlDailyRevenueData, { headers: { Authorization: `Bearer ${token}` } }));

      let urlInventoryAnalysis = `${REPORT_ENDPOINTS.DAILY_REVENUE_INVENTORY_ANALYSIS}?days=30`;
      if (storeId) urlInventoryAnalysis += `&store=${storeId}`;
      promises.push(fetch(urlInventoryAnalysis, { headers: { Authorization: `Bearer ${token}` } }));

      let urlRevenueForecast = `${REPORT_ENDPOINTS.DAILY_REVENUE_FORECAST}?days=7`;
      if (storeId) urlRevenueForecast += `&store=${storeId}`;
      promises.push(fetch(urlRevenueForecast, { headers: { Authorization: `Bearer ${token}` } }));

      // Top Performance
      let urlTopProducts = `${REPORT_ENDPOINTS.TOP_PRODUCTS}?days=30&limit=10`;
      if (storeId) urlTopProducts += `&store_id=${storeId}`;
      promises.push(fetch(urlTopProducts, { headers: { Authorization: `Bearer ${token}` } }));

      let urlTopCustomers = `${REPORT_ENDPOINTS.TOP_CUSTOMERS}`;
      promises.push(fetch(urlTopCustomers, { headers: { Authorization: `Bearer ${token}` } }));

      let urlBestSelling = `${REPORT_ENDPOINTS.BEST_SELLING}?limit=10`;
      promises.push(fetch(urlBestSelling, { headers: { Authorization: `Bearer ${token}` } }));

      // Wait for all APIs to complete
      const responses = await Promise.all(promises);
      const [
        resBestSellers, resInventoryTurnover, resDailyRevenue, resMonthlyRevenue, 
        resProfitAnalysis, resReturnSummary, resWarrantySummary, resFinancialImpact,
        resDailyRevenueData, resInventoryAnalysis, resRevenueForecast,
        resTopProducts, resTopCustomers, resBestSelling
      ] = responses;
      
      setBestSellers(await resBestSellers.json());
      setInventoryTurnover(await resInventoryTurnover.json());
      setDailyRevenue(await resDailyRevenue.json());
      setMonthlyRevenue(await resMonthlyRevenue.json());
      setProfitAnalysis(await resProfitAnalysis.json());
      setReturnSummary(await resReturnSummary.json());
      setWarrantySummary(await resWarrantySummary.json());
      setFinancialImpact(await resFinancialImpact.json());
      setDailyRevenueData(await resDailyRevenueData.json());
      setInventoryAnalysis(await resInventoryAnalysis.json());
      setRevenueForecast(await resRevenueForecast.json());
      setTopProducts(await resTopProducts.json());
      setTopCustomers(await resTopCustomers.json());
      setBestSelling(await resBestSelling.json());
    } catch (e) { 
      message.error('Lỗi tải dữ liệu báo cáo'); 
    }
    setLoading(false);
  }, [storeId, dateRange]);

  useEffect(() => { 
    const initializeData = async () => {
      setInitialLoading(true);
      setDataReady(false);
      try {
        // Load dashboard data and products in parallel
        await Promise.all([
          fetchOverview(), 
          fetchRecentActivity(), 
          fetchAlerts(), 
          fetchProducts()
        ]);
        // Then load other data
        await fetchAll();
        // Mark data as ready
        setDataReady(true);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    initializeData();
  }, [fetchOverview, fetchRecentActivity, fetchAlerts, fetchProducts, fetchAll]);
  
  useEffect(() => {
    if (!initialLoading) {
      fetchProductPerformance();
    }
  }, [fetchProductPerformance, initialLoading]);

  // Period options
  const periodOptions = ['today', 'week', 'month', 'year'];

  // Chart data helpers - updated for new API structure
  const dailyLabels = dailyRevenue?.daily_data?.map(d => d.date) || [];
  const dailyGross = dailyRevenue?.daily_data?.map(d => d.gross_revenue) || [];
  const dailyNet = dailyRevenue?.daily_data?.map(d => d.net_revenue) || [];

  const monthlyLabels = monthlyRevenue?.monthly_data?.map(m => m.month) || [];
  const monthlyGross = monthlyRevenue?.monthly_data?.map(m => m.gross_revenue) || [];
  const monthlyNet = monthlyRevenue?.monthly_data?.map(m => m.net_revenue) || [];

  const bestSellerLabels = bestSellers?.best_sellers?.map(p => p.product_name) || [];
  const bestSellerQty = bestSellers?.best_sellers?.map(p => p.total_quantity) || [];

  const turnoverLabels = inventoryTurnover?.turnover_data?.map(p => p.product_name) || [];
  const turnoverRates = inventoryTurnover?.turnover_data?.map(p => p.turnover_rate) || [];

  // Product performance data - updated for new API structure
  const performanceLabels = productPerformance?.performance_data?.map(p => p.period) || [];
  const performanceQty = productPerformance?.performance_data?.map(p => p.total_quantity) || [];
  const performanceRevenue = productPerformance?.performance_data?.map(p => p.total_revenue) || [];
  const performanceNetRevenue = productPerformance?.performance_data?.map(p => p.net_revenue) || [];

  // Top Products data - theo API exp2.txt
  const topProductLabels = Array.isArray(topProducts) ? topProducts.map(p => p.product_name) : [];
  const topProductRevenue = Array.isArray(topProducts) ? topProducts.map(p => p.total_revenue) : [];

  // Top Customers data - theo API exp2.txt
  const topCustomerLabels = Array.isArray(topCustomers) ? topCustomers.map(c => `${c.first_name} ${c.last_name}`) : [];
  const topCustomerSpent = Array.isArray(topCustomers) ? topCustomers.map(c => c.total_spent) : [];

  // Best Selling data - theo API exp2.txt
  const bestSellingLabels = Array.isArray(bestSelling) ? bestSelling.map(p => p.product_name) : [];
  const bestSellingRevenue = Array.isArray(bestSelling) ? bestSelling.map(p => p.total_revenue) : [];

  // Daily Revenue data - theo API exp2.txt
  const dailyRevenueLabels = dailyRevenueData?.daily_revenues?.map(d => d.date) || [];
  const dailyRevenueValues = dailyRevenueData?.daily_revenues?.map(d => d.order_revenue) || [];

  // Financial Impact data - theo API exp2.txt
  const financialImpactData = financialImpact?.financial_impact || {};

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
        profitAnalysis?.profit_summary?.total_profit || 0,
        profitAnalysis?.profit_summary?.total_cost || 0
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

  // Return Summary Chart Data - theo API exp2.txt
  const returnSummaryData = returnSummary?.product_analysis || [];
  const returnProductLabels = Array.isArray(returnSummaryData) ? returnSummaryData.map(p => p.product_name) : [];
  const returnQuantities = Array.isArray(returnSummaryData) ? returnSummaryData.map(p => p.total_returned_quantity) : [];
  const returnRates = Array.isArray(returnSummaryData) ? returnSummaryData.map(p => p.return_rate) : [];

  const returnProductChartData = {
    labels: returnProductLabels.slice(0, 8),
    datasets: [{
      label: 'Số lượng trả',
      data: returnQuantities.slice(0, 8),
      backgroundColor: 'rgba(255, 77, 79, 0.8)',
      borderRadius: 6,
    }]
  };

  const returnRateChartData = {
    labels: returnProductLabels.slice(0, 8),
    datasets: [{
      label: 'Tỷ lệ trả (%)',
      data: returnRates.slice(0, 8),
      backgroundColor: 'rgba(250, 173, 20, 0.8)',
      borderRadius: 6,
    }]
  };

  // Warranty Summary Chart Data - theo API exp2.txt
  const warrantySummaryData = warrantySummary?.warranty_analysis || [];
  const warrantyProductLabels = Array.isArray(warrantySummaryData) ? warrantySummaryData.map(p => p.product_name) : [];
  const warrantyClaims = Array.isArray(warrantySummaryData) ? warrantySummaryData.map(p => p.warranty_claim_count) : [];
  const warrantyRates = Array.isArray(warrantySummaryData) ? warrantySummaryData.map(p => p.claim_rate) : [];

  const warrantyProductChartData = {
    labels: warrantyProductLabels.slice(0, 8),
    datasets: [{
      label: 'Số lần bảo hành',
      data: warrantyClaims.slice(0, 8),
      backgroundColor: 'rgba(24, 144, 255, 0.8)',
      borderRadius: 6,
    }]
  };

  const warrantyRateChartData = {
    labels: warrantyProductLabels.slice(0, 8),
    datasets: [{
      label: 'Tỷ lệ bảo hành (%)',
      data: warrantyRates.slice(0, 8),
      backgroundColor: 'rgba(82, 196, 26, 0.8)',
      borderRadius: 6,
    }]
  };

  // Financial Impact Chart Data
  const financialChartData = {
    labels: ['Doanh thu', 'Tiền hoàn', 'Chi phí sửa chữa', 'Doanh thu ròng'],
    datasets: [{
      label: 'Số tiền (VNĐ)',
      data: [
        financialImpactData.total_revenue || 0,
        financialImpactData.total_returns || 0,
        financialImpactData.total_warranty_costs || 0,
        financialImpactData.net_revenue || 0
      ],
      backgroundColor: [
        'rgba(24, 144, 255, 0.8)',
        'rgba(255, 77, 79, 0.8)',
        'rgba(250, 173, 20, 0.8)',
        'rgba(82, 196, 26, 0.8)'
      ],
      borderRadius: 8,
    }]
  };

  // Profit Analysis Chart Data - theo API exp2.txt
  const profitAnalysisData = profitAnalysis?.profit_by_product || [];
  const profitLabels = Array.isArray(profitAnalysisData) ? profitAnalysisData.map(p => p.product_name) : [];
  const profitNetProfit = Array.isArray(profitAnalysisData) ? profitAnalysisData.map(p => p.total_profit) : [];
  const profitMargin = Array.isArray(profitAnalysisData) ? profitAnalysisData.map(p => p.profit_margin) : [];

  const profitChartData = {
    labels: profitLabels.slice(0, 8),
    datasets: [{
      label: 'Lợi nhuận (VNĐ)',
      data: profitNetProfit.slice(0, 8),
      backgroundColor: 'rgba(0, 150, 136, 0.8)',
      borderRadius: 6,
    }]
  };

  const marginChartData = {
    labels: profitLabels.slice(0, 8),
    datasets: [{
      label: 'Biên lợi nhuận (%)',
      data: profitMargin.slice(0, 8),
      backgroundColor: 'rgba(255, 193, 7, 0.8)',
      borderRadius: 6,
    }]
  };

  // Top Products Chart Data
  const topProductsChartData = {
    labels: topProductLabels.slice(0, 8),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: topProductRevenue.slice(0, 8),
      backgroundColor: 'rgba(24, 144, 255, 0.8)',
      borderRadius: 6,
    }]
  };

  // Top Customers Chart Data
  const topCustomersChartData = {
    labels: topCustomerLabels.slice(0, 8),
    datasets: [{
      label: 'Tổng chi tiêu (VNĐ)',
      data: topCustomerSpent.slice(0, 8),
      backgroundColor: 'rgba(82, 196, 26, 0.8)',
      borderRadius: 6,
    }]
  };

  // Best Selling Chart Data
  const bestSellingChartData = {
    labels: bestSellingLabels.slice(0, 8),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: bestSellingRevenue.slice(0, 8),
      backgroundColor: 'rgba(250, 173, 20, 0.8)',
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
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Doanh thu gốc',
        data: performanceRevenue,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Doanh thu thực',
        data: performanceNetRevenue,
        borderColor: '#faad14',
        backgroundColor: 'rgba(250, 173, 20, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        pointRadius: 4,
        pointHoverRadius: 6,
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

  // Table columns for best sellers
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
      title: 'Doanh thu ròng',
      dataIndex: 'net_revenue',
      key: 'net_revenue',
      render: (value) => (
        <span style={{fontWeight: 600, color: '#1890ff'}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (value) => (
        <Tag color={value < 10 ? 'red' : value < 50 ? 'orange' : 'green'}>
          {formatVND(value || 0)}
        </Tag>
      ),
    },
  ];

  // Table columns for inventory turnover
  const turnoverColumns = [
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
      dataIndex: 'total_sold',
      key: 'total_sold',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Tồn kho đầu kỳ',
      dataIndex: 'beginning_stock',
      key: 'beginning_stock',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Tồn kho cuối kỳ',
      dataIndex: 'ending_stock',
      key: 'ending_stock',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Tồn kho trung bình',
      dataIndex: 'average_stock',
      key: 'average_stock',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Ngày bán hết',
      dataIndex: 'days_to_sell',
      key: 'days_to_sell',
      render: (value) => (
        <Tag color={value < 30 ? 'green' : value < 90 ? 'orange' : 'red'}>
          {value || 0} ngày
        </Tag>
      ),
    },
    {
      title: 'Tồn kho cuối kỳ',
      dataIndex: 'ending_stock',
      key: 'ending_stock',
      render: (value) => (
        <span style={{fontWeight: 600}}>
          {formatVND(value || 0)}
        </span>
      ),
    },
  ];

  // Table columns for return orders
  const returnOrdersColumns = [
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
      dataIndex: 'total_sold_quantity',
      key: 'total_sold_quantity',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Số lượng trả',
      dataIndex: 'total_returned_quantity',
      key: 'total_returned_quantity',
      sorter: (a, b) => a.total_returned_quantity - b.total_returned_quantity,
      render: (value) => (
        <Tag color="red">{formatVND(value || 0)}</Tag>
      ),
    },
    {
      title: 'Tỷ lệ trả',
      dataIndex: 'return_rate',
      key: 'return_rate',
      sorter: (a, b) => a.return_rate - b.return_rate,
      render: (value) => (
        <Tag color={value > 10 ? 'red' : value > 5 ? 'orange' : 'green'}>
          {value.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: 'Tiền hoàn',
      dataIndex: 'total_refund_amount',
      key: 'total_refund_amount',
      render: (value) => (
        <span style={{fontWeight: 600, color: '#ff4d4f'}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
    {
      title: 'Đơn trả',
      dataIndex: 'return_orders_count',
      key: 'return_orders_count',
      render: (value) => (
        <Tag color="blue">{value || 0}</Tag>
      ),
    },
  ];

  // Table columns for warranty
  const warrantyColumns = [
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
      title: 'Số lượng bảo hành',
      dataIndex: 'warranty_count',
      key: 'warranty_count',
      render: (value) => formatVND(value || 0),
    },
    {
      title: 'Số lần bảo hành',
      dataIndex: 'warranty_claim_count',
      key: 'warranty_claim_count',
      sorter: (a, b) => a.warranty_claim_count - b.warranty_claim_count,
      render: (value) => (
        <Tag color="blue">{formatVND(value || 0)}</Tag>
      ),
    },
    {
      title: 'Tỷ lệ bảo hành',
      dataIndex: 'claim_rate',
      key: 'claim_rate',
      sorter: (a, b) => a.claim_rate - b.claim_rate,
      render: (value) => (
        <Tag color={value > 10 ? 'red' : value > 5 ? 'orange' : 'green'}>
          {value.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: 'Chi phí sửa chữa',
      dataIndex: 'total_repair_cost',
      key: 'total_repair_cost',
      render: (value) => (
        <span style={{fontWeight: 600, color: '#722ed1'}}>
          {formatVND(value || 0)}₫
        </span>
      ),
    },
  ];

  // Mini statistics cards data - updated for new API structure
  const miniStats = [
    {
      title: 'Tổng đơn hàng',
      value: overview?.orders?.total_orders || dailyRevenue?.summary?.total_orders || 0,
      suffix: 'đơn',
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      growth: overview?.orders?.order_growth || 0,
    },
    {
      title: 'Sản phẩm đã bán',
      value: overview?.orders?.total_items || 0,
      suffix: 'SP',
      icon: <InboxOutlined />,
      color: '#52c41a',
    },
    {
      title: 'AOV (Giá trị đơn trung bình)',
      value: overview?.orders?.average_order_value || dailyRevenue?.summary?.average_order_value || 0,
      suffix: '₫',
      icon: <DollarOutlined />,
      color: '#faad14',
      growth: overview?.orders?.order_growth || 0,
    },
    {
      title: 'Tỷ lệ trả hàng',
      value: returnSummary?.summary?.return_rate || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#722ed1',
    },
  ];

  // Return Orders Statistics Cards
  const returnStats = [
    {
      title: 'Đơn hàng trả',
      value: returnSummary?.summary?.total_return_orders || 0,
      suffix: 'đơn',
      icon: <ShoppingOutlined />,
      color: '#ff4d4f',
      percentage: returnSummary?.summary?.return_rate || 0,
    },
    {
      title: 'Sản phẩm trả',
      value: returnSummary?.summary?.total_returned_items || 0,
      suffix: 'SP',
      icon: <InboxOutlined />,
      color: '#faad14',
    },
    {
      title: 'Tiền hoàn',
      value: returnSummary?.summary?.total_refund_amount || 0,
      suffix: '₫',
      icon: <DollarOutlined />,
      color: '#ff7875',
    },
    {
      title: 'Tỷ lệ trả',
      value: returnSummary?.summary?.return_rate || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#ff4d4f',
    },
  ];

  // Warranty Statistics Cards
  const warrantyStats = [
    {
      title: 'Bảo hành',
      value: warrantySummary?.summary?.total_warranties || 0,
      suffix: 'bảo hành',
      icon: <BarChartOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Yêu cầu bảo hành',
      value: warrantySummary?.summary?.total_warranty_claims || 0,
      suffix: 'yêu cầu',
      icon: <AlertOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Chi phí sửa chữa',
      value: warrantySummary?.summary?.total_repair_cost || 0,
      suffix: '₫',
      icon: <DollarOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Tỷ lệ yêu cầu',
      value: warrantySummary?.summary?.warranty_claim_rate || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#1890ff',
    },
  ];

  // Profit analysis cards - updated for new API structure
  const profitStats = [
    {
      title: 'Lãi gộp',
      value: profitAnalysis?.profit_summary?.total_profit || 0,
      suffix: '₫',
      icon: <ArrowUpOutlined />,
      color: '#52c41a',
      percentage: profitAnalysis?.profit_summary?.profit_margin || 0,
    },
    {
      title: 'Tỷ suất lãi gộp',
      value: profitAnalysis?.profit_summary?.profit_margin || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Lãi ròng',
      value: profitAnalysis?.profit_summary?.total_profit || 0,
      suffix: '₫',
      icon: <ShoppingOutlined />,
      color: '#faad14',
    },
    {
      title: 'Chi phí nhập hàng',
      value: profitAnalysis?.profit_summary?.total_cost || 0,
      suffix: '₫',
      icon: <InboxOutlined />,
      color: '#ff4d4f',
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
              options={periodOptions.map(p => ({ 
                value: p, 
                label: p === 'today' ? 'Hôm nay' : 
                       p === 'week' ? 'Tuần này' : 
                       p === 'month' ? 'Tháng này' : 'Năm nay' 
              }))}
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
      {(alerts?.low_stock_alerts?.length > 0 || alerts?.expired_warranties?.length > 0 || alerts?.pending_returns?.length > 0) && (
        <div className="alerts-button-container">
          <Popover
            content={
              <div className="alerts-popover-content">
                <div className="alerts-popover-header">
                  <AlertOutlined className="alerts-icon" />
                  Cảnh báo hệ thống
                </div>
                <div className="alerts-list">
                  {alerts.low_stock_alerts?.map((alert, index) => (
                    <div key={`stock-${index}`} className="alert-item alert-level-warning">
                      <div className="alert-title">
                        Tồn kho thấp
                      </div>
                      <div className="alert-message">
                        {alert.product_name} - Còn {alert.current_stock} sản phẩm
                      </div>
                    </div>
                  ))}
                  {alerts.expired_warranties?.map((alert, index) => (
                    <div key={`warranty-${index}`} className="alert-item alert-level-error">
                      <div className="alert-title">
                        Bảo hành sắp hết hạn
                      </div>
                      <div className="alert-message">
                        {alert.product_name} - Còn {alert.days_remaining} ngày
                      </div>
                    </div>
                  ))}
                  {alerts.pending_returns?.map((alert, index) => (
                    <div key={`return-${index}`} className="alert-item alert-level-info">
                      <div className="alert-title">
                        Đơn trả chờ xử lý
                      </div>
                      <div className="alert-message">
                        Đơn #{alert.return_id} - {alert.customer_name}
                      </div>
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
            <Badge count={(alerts?.low_stock_alerts?.length || 0) + (alerts?.expired_warranties?.length || 0) + (alerts?.pending_returns?.length || 0)} size="small">
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
                    {overview?.orders?.total_customers || 0} khách hàng
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
                  <div className="kpi-title">Sản phẩm đã bán</div>
                  <div className="kpi-value kpi-value-purple">
                    {formatVND(overview?.orders?.total_items || 0)}
                  </div>
                  <div className="kpi-subtitle">
                    {overview?.inventory?.total_products || 0} sản phẩm trong kho
                  </div>
                </div>
                <div className="kpi-card-icon kpi-icon-purple">
                  <InboxOutlined />
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

      {/* Return Orders Statistics Cards */}
      {dataReady && (
        <div className="dashboard-chart-container return-stats-container">
          <div className="dashboard-table-title">Thống kê trả hàng</div>
          <Row gutter={[16, 16]}>
            {returnStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="return-stat-card">
                  <div className="return-stat-title">
                    {stat.title}
                  </div>
                  <div className="return-stat-value" style={{color: stat.color}}>
                    {formatVND(stat.value)}{stat.suffix}
                  </div>
                  {stat.percentage !== undefined && (
                    <div className="return-stat-percentage">
                      {stat.percentage}% tổng đơn hàng
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Warranty Statistics Cards */}
      {dataReady && (
        <div className="dashboard-chart-container warranty-stats-container">
          <div className="dashboard-table-title">Thống kê bảo hành</div>
          <Row gutter={[16, 16]}>
            {warrantyStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="warranty-stat-card">
                  <div className="warranty-stat-title">
                    {stat.title}
                  </div>
                  <div className="warranty-stat-value" style={{color: stat.color}}>
                    {formatVND(stat.value)}{stat.suffix}
                  </div>
                  {stat.percentage !== undefined && (
                    <div className="warranty-stat-percentage">
                      {stat.percentage}% tổng sản phẩm
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
            label: 'Hiệu suất bán hàng',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Hiệu suất bán hàng theo thời gian</div>
                    <div style={{marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                      {productPerformance?.summary?.period && (
                        <div style={{marginBottom: 16, padding: '12px 16px', backgroundColor: '#f5f5f5', borderRadius: 6, fontSize: 14}}>
                          <strong>Kỳ báo cáo:</strong> {productPerformance.summary.period.start_date} - {productPerformance.summary.period.end_date} 
                          ({productPerformance.summary.period.period_type === 'daily' ? 'Theo ngày' : productPerformance.summary.period.period_type === 'weekly' ? 'Theo tuần' : 'Theo tháng'})
                        </div>
                      )}
                      <div>
                        <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Chọn sản phẩm</label>
                        <Select
                          showSearch
                          placeholder="Tìm và chọn sản phẩm"
                          value={selectedProduct}
                          onChange={setSelectedProduct}
                          style={{ minWidth: 300 }}
                          loading={productsLoading}
                          allowClear
                          notFoundContent={productsLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
                          filterOption={(input, option) => {
                            const searchText = input.toLowerCase();
                            const productName = option.label.toLowerCase();
                            const sku = option.sku ? option.sku.toLowerCase() : '';
                            return productName.includes(searchText) || sku.includes(searchText);
                          }}
                          onSearch={(value) => {
                            console.log('Searching for:', value);
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
                        Vui lòng chọn sản phẩm để xem hiệu suất bán hàng
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Tóm tắt hiệu suất bán hàng</div>
                    {productPerformance?.summary ? (
                      <div className="performance-summary">
                        <div className="performance-item">
                          <span className="performance-label">Tổng số lượng bán:</span>
                          <span className="performance-value quantity">
                            {formatVND(productPerformance.summary.total_quantity || 0)}
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Doanh thu gốc:</span>
                          <span className="performance-value revenue">
                            {formatVND(productPerformance.summary.total_revenue || 0)}₫
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Doanh thu thực:</span>
                          <span className="performance-value net-revenue">
                            {formatVND(productPerformance.summary.total_net_revenue || 0)}₫
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Tổng đơn hàng:</span>
                          <span className="performance-value orders">
                            {formatVND(productPerformance.summary.total_orders || 0)}
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Tổng giảm giá:</span>
                          <span className="performance-value discount">
                            {formatVND(productPerformance.summary.total_discounts || 0)}₫
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">SL trung bình/kỳ:</span>
                          <span className="performance-value avg-quantity">
                            {formatVND(productPerformance.summary.average_quantity_per_period || 0)}
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">DT trung bình/kỳ:</span>
                          <span className="performance-value avg-revenue">
                            {formatVND(productPerformance.summary.average_revenue_per_period || 0)}₫
                          </span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Tỷ lệ giảm giá:</span>
                          <span className="performance-value discount-rate">
                            {((productPerformance.summary.total_discounts || 0) / (productPerformance.summary.total_revenue || 1) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{textAlign: 'center', padding: 40, color: '#666'}}>
                        Chưa có dữ liệu hiệu suất
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
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
                      dataSource={inventoryTurnover?.turnover_data || []}
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
                      dataSource={returnSummary?.product_analysis || []}
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
              <Row gutter={[16, 16]}>
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
                    <div className="dashboard-table-title">Bảng chi tiết bảo hành</div>
                    <Table
                      dataSource={warrantySummary?.warranty_analysis || []}
                      columns={warrantyColumns}
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
            key: '8',
            label: 'Lợi nhuận ròng',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Lợi nhuận theo sản phẩm</div>
                    <div style={{height: 250}}>
                      <Bar data={profitChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Biên lợi nhuận theo sản phẩm</div>
                    <Table
                      dataSource={profitAnalysis?.profit_by_product || []}
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
                          title: 'Lợi nhuận',
                          dataIndex: 'total_profit',
                          key: 'total_profit',
                          sorter: (a, b) => a.total_profit - b.total_profit,
                          render: (value) => (
                            <span style={{fontWeight: 600, color: '#009688'}}>
                              {formatVND(value || 0)}₫
                            </span>
                          ),
                        },
                        {
                          title: 'Biên lợi nhuận',
                          dataIndex: 'profit_margin',
                          key: 'profit_margin',
                          sorter: (a, b) => a.profit_margin - b.profit_margin,
                          render: (value) => (
                            <Tag color={value > 10 ? 'green' : value > 5 ? 'orange' : 'red'}>
                              {value.toFixed(2)}%
                            </Tag>
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
            )
          },
          {
            key: '9',
            label: 'Phân tích tài chính',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-chart-container" style={{marginBottom: 24}}>
                    <div className="dashboard-table-title">Tác động tài chính tổng hợp</div>
                    <div style={{height: 300}}>
                      <Bar data={financialChartData} options={chartOptions} />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Tóm tắt tài chính</div>
                                          <div className="financial-summary">
                        <div className="financial-item">
                          <span className="financial-label">Doanh thu:</span>
                          <span className="financial-value positive">
                            {formatVND(financialImpactData.total_revenue || 0)}₫
                          </span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Tiền hoàn trả:</span>
                          <span className="financial-value negative">
                            -{formatVND(financialImpactData.total_returns || 0)}₫
                          </span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Chi phí sửa chữa:</span>
                          <span className="financial-value negative">
                            -{formatVND(financialImpactData.total_warranty_costs || 0)}₫
                          </span>
                        </div>
                        <div className="financial-item total">
                          <span className="financial-label">Doanh thu ròng:</span>
                          <span className={`financial-value ${(financialImpactData.net_revenue || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {formatVND(financialImpactData.net_revenue || 0)}₫
                          </span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Tỷ lệ trả hàng:</span>
                          <span className="financial-value">
                            {(financialImpactData.return_rate || 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Tỷ lệ chi phí bảo hành:</span>
                          <span className="financial-value">
                            {(financialImpactData.warranty_cost_rate || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                  </div>
                </Col>
              </Row>
            )
          },
          {
            key: '10',
            label: 'Thống kê tổng hợp',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Phân tích trả hàng</div>
                    <div className="comprehensive-summary">
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Tổng đơn trả:</span>
                        <span className="comprehensive-value">
                          {returnSummary?.summary?.total_return_orders || 0}
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Sản phẩm trả:</span>
                        <span className="comprehensive-value">
                          {returnSummary?.summary?.total_returned_items || 0}
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Số lượng trả:</span>
                        <span className="comprehensive-value">
                          {returnSummary?.summary?.total_returned_quantity || 0}
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Tiền hoàn:</span>
                        <span className="comprehensive-value negative">
                          -{formatVND(returnSummary?.summary?.total_refund_amount || 0)}₫
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Tỷ lệ trả:</span>
                        <span className="comprehensive-value">
                          {(returnSummary?.summary?.return_rate || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Phân tích bảo hành</div>
                    <div className="comprehensive-summary">
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Tổng bảo hành:</span>
                        <span className="comprehensive-value">
                          {warrantySummary?.summary?.total_warranties || 0}
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Yêu cầu bảo hành:</span>
                        <span className="comprehensive-value">
                          {warrantySummary?.summary?.total_warranty_claims || 0}
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Chi phí sửa chữa:</span>
                        <span className="comprehensive-value negative">
                          -{formatVND(warrantySummary?.summary?.total_repair_cost || 0)}₫
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Tỷ lệ yêu cầu:</span>
                        <span className="comprehensive-value">
                          {(warrantySummary?.summary?.warranty_claim_rate || 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="comprehensive-item">
                        <span className="comprehensive-label">Chi phí trung bình:</span>
                        <span className="comprehensive-value">
                          {formatVND(warrantySummary?.summary?.average_repair_cost || 0)}₫
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )
          },
          {
            key: '11',
            label: 'Top sản phẩm & khách hàng',
            children: (
              <Row gutter={[16, 16]}>
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
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Bảng top sản phẩm</div>
                    <Table
                      dataSource={topProducts || []}
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
                <Col xs={24} lg={12}>
                  <div className="dashboard-table-container">
                    <div className="dashboard-table-title">Bảng top khách hàng</div>
                    <Table
                      dataSource={topCustomers || []}
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
                          render: (value) => formatVND(value || 0),
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
          },
          {
            key: '12',
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
                      dataSource={bestSelling || []}
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
      )}

    </div>
  );
} 