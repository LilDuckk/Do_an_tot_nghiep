import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { REPORT_ENDPOINTS, PRODUCT_ENDPOINTS } from '@/config/api';

export const useDashboardData = () => {
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
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  
  // Sales Analysis data
  const [bestSellers, setBestSellers] = useState(null);
  const [salesPerformance, setSalesPerformance] = useState(null);
  const [inventoryTurnover, setInventoryTurnover] = useState(null);
  
  // Revenue data
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [profitAnalysis, setProfitAnalysis] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState(null);
  const [inventoryAnalysis, setInventoryAnalysis] = useState(null);
  
  // Return & Warranty data
  const [returnSummary, setReturnSummary] = useState(null);
  const [warrantySummary, setWarrantySummary] = useState(null);
  const [financialImpact, setFinancialImpact] = useState(null);
  const [returnProductAnalysis, setReturnProductAnalysis] = useState(null);
  const [warrantyProductAnalysis, setWarrantyProductAnalysis] = useState(null);
  const [productProfitability, setProductProfitability] = useState(null);
  
  // Daily Revenue data
  const [dailyRevenueData, setDailyRevenueData] = useState(null);
  const [revenueForecast, setRevenueForecast] = useState(null);
  
  // Top Performance data
  const [topProducts, setTopProducts] = useState(null);
  const [topCustomers, setTopCustomers] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);

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

  // Fetch comprehensive analysis
  const fetchComprehensiveAnalysis = useCallback(async () => {
    try {
      let url = `${REPORT_ENDPOINTS.DASHBOARD_COMPREHENSIVE_ANALYSIS}`;
      if (dateRange && dateRange.length === 2) {
        url += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) url += `&store_id=${storeId}`;
      } else if (storeId) {
        url += `?store_id=${storeId}`;
      }
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setComprehensiveAnalysis(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải phân tích tổng hợp'); 
      }
    }
  }, [storeId, dateRange]);

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
      if (storeId) urlInventoryTurnover += `&store_id=${storeId}`;
      promises.push(fetch(urlInventoryTurnover, { headers: { Authorization: `Bearer ${token}` } }));

      // Revenue Reports - Sửa endpoint đúng
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

      // Thêm các API mới
      let urlDailySummary = `${REPORT_ENDPOINTS.DAILY_REVENUE_SUMMARY}`;
      if (dateRange && dateRange.length === 2) {
        urlDailySummary += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDailySummary += `&store_id=${storeId}`;
      } else if (storeId) {
        urlDailySummary += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlDailySummary, { headers: { Authorization: `Bearer ${token}` } }));

      let urlDailyBreakdown = `${REPORT_ENDPOINTS.DAILY_REVENUE_BREAKDOWN}`;
      if (dateRange && dateRange.length === 2) {
        urlDailyBreakdown += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDailyBreakdown += `&store_id=${storeId}`;
      } else if (storeId) {
        urlDailyBreakdown += `&store_id=${storeId}`;
      }
      promises.push(fetch(urlDailyBreakdown, { headers: { Authorization: `Bearer ${token}` } }));

      let urlInventoryAnalysis = `${REPORT_ENDPOINTS.DAILY_REVENUE_INVENTORY_ANALYSIS}?days=30`;
      if (storeId) urlInventoryAnalysis += `&store_id=${storeId}`;
      promises.push(fetch(urlInventoryAnalysis, { headers: { Authorization: `Bearer ${token}` } }));

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
        urlFinancialImpact += `&store_id=${storeId}`;
      }
      promises.push(fetch(urlFinancialImpact, { headers: { Authorization: `Bearer ${token}` } }));

      // Thêm các API phân tích sản phẩm
      let urlReturnProductAnalysis = `${REPORT_ENDPOINTS.RETURN_PRODUCT_ANALYSIS}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlReturnProductAnalysis += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) urlReturnProductAnalysis += `&store_id=${storeId}`;
      promises.push(fetch(urlReturnProductAnalysis, { headers: { Authorization: `Bearer ${token}` } }));

      let urlWarrantyProductAnalysis = `${REPORT_ENDPOINTS.WARRANTY_PRODUCT_ANALYSIS}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlWarrantyProductAnalysis += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) urlWarrantyProductAnalysis += `&store_id=${storeId}`;
      promises.push(fetch(urlWarrantyProductAnalysis, { headers: { Authorization: `Bearer ${token}` } }));

      let urlProductProfitability = `${REPORT_ENDPOINTS.PRODUCT_PROFITABILITY}?limit=10`;
      if (dateRange && dateRange.length === 2) {
        urlProductProfitability += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) urlProductProfitability += `&store_id=${storeId}`;
      promises.push(fetch(urlProductProfitability, { headers: { Authorization: `Bearer ${token}` } }));

      // Daily Revenue - Sửa parameter đúng
      let urlDailyRevenueData = `${REPORT_ENDPOINTS.DAILY_REVENUE_CALCULATE}`;
      if (dateRange && dateRange.length === 2) {
        urlDailyRevenueData += `?start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
        if (storeId) urlDailyRevenueData += `&store_id=${storeId}`;
      } else if (storeId) {
        urlDailyRevenueData += `?store_id=${storeId}`;
      }
      promises.push(fetch(urlDailyRevenueData, { headers: { Authorization: `Bearer ${token}` } }));

      let urlRevenueForecast = `${REPORT_ENDPOINTS.DAILY_REVENUE_FORECAST}?days=7`;
      if (storeId) urlRevenueForecast += `&store_id=${storeId}`;
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
        resProfitAnalysis, resDailySummary, resDailyBreakdown, resInventoryAnalysis,
        resReturnSummary, resWarrantySummary, resFinancialImpact,
        resReturnProductAnalysis, resWarrantyProductAnalysis, resProductProfitability,
        resDailyRevenueData, resRevenueForecast,
        resTopProducts, resTopCustomers, resBestSelling
      ] = responses;
      
      setBestSellers(await resBestSellers.json());
      setInventoryTurnover(await resInventoryTurnover.json());
      setDailyRevenue(await resDailyRevenue.json());
      setMonthlyRevenue(await resMonthlyRevenue.json());
      setProfitAnalysis(await resProfitAnalysis.json());
      setDailySummary(await resDailySummary.json());
      setDailyBreakdown(await resDailyBreakdown.json());
      setInventoryAnalysis(await resInventoryAnalysis.json());
      setReturnSummary(await resReturnSummary.json());
      setWarrantySummary(await resWarrantySummary.json());
      setFinancialImpact(await resFinancialImpact.json());
      setReturnProductAnalysis(await resReturnProductAnalysis.json());
      setWarrantyProductAnalysis(await resWarrantyProductAnalysis.json());
      setProductProfitability(await resProductProfitability.json());
      setDailyRevenueData(await resDailyRevenueData.json());
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
        // Load dashboard data in parallel
        await Promise.all([
          fetchOverview(), 
          fetchRecentActivity(), 
          fetchAlerts(),
          fetchComprehensiveAnalysis()
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
  }, [fetchOverview, fetchRecentActivity, fetchAlerts, fetchComprehensiveAnalysis, fetchAll]);

  return {
    // Filters
    period,
    setPeriod,
    storeId,
    setStoreId,
    dateRange,
    setDateRange,
    
    // Loading states
    loading,
    initialLoading,
    dataReady,
    
    // Data
    overview,
    recentActivity,
    alerts,
    comprehensiveAnalysis,
    bestSellers,
    inventoryTurnover,
    dailyRevenue,
    monthlyRevenue,
    profitAnalysis,
    dailySummary,
    dailyBreakdown,
    inventoryAnalysis,
    returnSummary,
    warrantySummary,
    financialImpact,
    returnProductAnalysis,
    warrantyProductAnalysis,
    productProfitability,
    dailyRevenueData,
    revenueForecast,
    topProducts,
    topCustomers,
    bestSelling,
    
    // Functions
    fetchOverview,
    fetchRecentActivity,
    fetchAlerts,
    fetchComprehensiveAnalysis,
    fetchAll
  };
}; 