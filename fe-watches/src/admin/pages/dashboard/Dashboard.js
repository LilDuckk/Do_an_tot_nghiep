import React from 'react';
import '@/admin/static/AdminLayout.css';
import '@/admin/static/Admin.css';
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

// Import components
import { 
  DashboardHeader,
  DashboardFilters,
  AlertsButton,
  LoadingOverlay,
  KPICards,
  StatisticsCards,
  DashboardTabs
} from './components';

// Import hooks
import { 
  useDashboardData,
  useProductPerformance,
  useAlerts
} from './hooks';

// Import utils
import {
  chartOptions,
  productPerformanceChartOptions,
  createRevenueChartData,
  createMonthlyChartData,
  createBestSellersChartData,
  createProfitDistributionData,
  createTurnoverChartData,
  createReturnProductChartData,
  createWarrantyProductChartData,
  createFinancialChartData,
  createProfitChartData,
  createTopProductsChartData,
  createTopCustomersChartData,
  createBestSellingChartData,
  createProductPerformanceChartData
} from './utils';

import '@/admin/static/Dashboard.css';

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
  // Period options
  const periodOptions = ['today', 'week', 'month', 'year'];

  // Use custom hooks
  const {
    // Filters
    period,
    setPeriod,
    storeId,
    setStoreId,
    dateRange,
    setDateRange,
    resetFilters,
    
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
    bestSelling
  } = useDashboardData();

  const {
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    productPerformance,
    products,
    variants,
    performancePeriod,
    setPerformancePeriod,
    productsLoading,
    variantsLoading
  } = useProductPerformance(storeId, dateRange);

  const {
    alertsVisible,
    setAlertsVisible
  } = useAlerts();

  // Create chart data
  const revenueChartData = createRevenueChartData(dailyRevenue);
  const monthlyChartData = createMonthlyChartData(monthlyRevenue);
  const bestSellersChartData = createBestSellersChartData(bestSellers);
  const profitDistributionData = createProfitDistributionData(profitAnalysis);
  const turnoverChartData = createTurnoverChartData(inventoryTurnover);
  const returnProductChartData = createReturnProductChartData(returnSummary);
  const warrantyProductChartData = createWarrantyProductChartData(warrantySummary);
  const financialChartData = createFinancialChartData(financialImpact);
  const profitChartData = createProfitChartData(profitAnalysis);
  const topProductsChartData = createTopProductsChartData(topProducts);
  const topCustomersChartData = createTopCustomersChartData(topCustomers);
  const bestSellingChartData = createBestSellingChartData(bestSelling);
  const productPerformanceChartData = createProductPerformanceChartData(productPerformance);

  return (
    <div className="admin-dashboard-container">
      {/* Loading overlay */}
      <LoadingOverlay loading={loading} initialLoading={initialLoading} />
      
      {/* Header */}
      <DashboardHeader />

      {/* Filters */}
      <DashboardFilters 
        period={period}
        setPeriod={setPeriod}
        dateRange={dateRange}
        setDateRange={setDateRange}
        periodOptions={periodOptions}
        storeId={storeId}
        setStoreId={setStoreId}
        resetFilters={resetFilters}
        loading={loading}
      />

      {/* Alerts Button */}
      <AlertsButton 
        alerts={alerts}
        alertsVisible={alertsVisible}
        setAlertsVisible={setAlertsVisible}
      />

      {/* KPI Cards */}
      <KPICards 
        overview={overview}
        dataReady={dataReady}
      />

      {/* Statistics Cards */}
      <StatisticsCards 
        overview={overview}
        dailyRevenue={dailyRevenue}
        returnSummary={returnSummary}
        warrantySummary={warrantySummary}
        profitAnalysis={profitAnalysis}
        dataReady={dataReady}
      />

      {/* Dashboard Tabs */}
      <DashboardTabs 
        dataReady={dataReady}
        // Chart data
        revenueChartData={revenueChartData}
        monthlyChartData={monthlyChartData}
        bestSellersChartData={bestSellersChartData}
        turnoverChartData={turnoverChartData}
        profitDistributionData={profitDistributionData}
        returnProductChartData={returnProductChartData}
        warrantyProductChartData={warrantyProductChartData}
        financialChartData={financialChartData}
        profitChartData={profitChartData}
        topProductsChartData={topProductsChartData}
        topCustomersChartData={topCustomersChartData}
        bestSellingChartData={bestSellingChartData}
        productPerformanceChartData={productPerformanceChartData}
        // Table data
        bestSellers={bestSellers}
        inventoryTurnover={inventoryTurnover}
        returnSummary={returnSummary}
        warrantySummary={warrantySummary}
        profitAnalysis={profitAnalysis}
        financialImpact={financialImpact}
        returnProductAnalysis={returnProductAnalysis}
        warrantyProductAnalysis={warrantyProductAnalysis}
        productProfitability={productProfitability}
        dailySummary={dailySummary}
        dailyBreakdown={dailyBreakdown}
        inventoryAnalysis={inventoryAnalysis}
        comprehensiveAnalysis={comprehensiveAnalysis}
        topProducts={topProducts}
        topCustomers={topCustomers}
        bestSelling={bestSelling}
        // Revenue data
        dailyRevenue={dailyRevenue}
        monthlyRevenue={monthlyRevenue}
        // Product performance
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        products={products}
        variants={variants}
        productsLoading={productsLoading}
        variantsLoading={variantsLoading}
        performancePeriod={performancePeriod}
        setPerformancePeriod={setPerformancePeriod}
        productPerformance={productPerformance}
      />
    </div>
  );
} 