export const createRevenueChartData = (dailyRevenue) => {
  const dailyLabels = Array.isArray(dailyRevenue?.daily_data) ? dailyRevenue.daily_data.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }) : [];
  const dailyGross = Array.isArray(dailyRevenue?.daily_data) ? dailyRevenue.daily_data.map(d => d.gross_revenue) : [];
  const dailyNet = Array.isArray(dailyRevenue?.daily_data) ? dailyRevenue.daily_data.map(d => d.net_revenue) : [];
  const dailyDiscounts = Array.isArray(dailyRevenue?.daily_data) ? dailyRevenue.daily_data.map(d => d.total_discounts) : [];
  const dailyOrders = Array.isArray(dailyRevenue?.daily_data) ? dailyRevenue.daily_data.map(d => d.total_orders) : [];

  return {
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
        yAxisID: 'y',
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
        yAxisID: 'y',
      },
      {
        label: 'Giảm giá',
        data: dailyDiscounts,
        borderColor: '#faad14',
        backgroundColor: 'rgba(250, 173, 20, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Số đơn hàng',
        data: dailyOrders,
        borderColor: '#722ed1',
        backgroundColor: 'rgba(114, 46, 209, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1',
        type: 'line',
      }
    ]
  };
};

export const createMonthlyChartData = (monthlyRevenue) => {
  const monthlyLabels = Array.isArray(monthlyRevenue?.monthly_data) ? monthlyRevenue.monthly_data.map(m => m.month_name) : [];
  const monthlyGross = Array.isArray(monthlyRevenue?.monthly_data) ? monthlyRevenue.monthly_data.map(m => m.gross_revenue) : [];
  const monthlyNet = Array.isArray(monthlyRevenue?.monthly_data) ? monthlyRevenue.monthly_data.map(m => m.net_revenue) : [];
  const monthlyDiscounts = Array.isArray(monthlyRevenue?.monthly_data) ? monthlyRevenue.monthly_data.map(m => m.total_discounts) : [];
  const monthlyOrders = Array.isArray(monthlyRevenue?.monthly_data) ? monthlyRevenue.monthly_data.map(m => m.total_orders) : [];

  return {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Doanh thu gốc',
        data: monthlyGross,
        backgroundColor: 'rgba(24, 144, 255, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Doanh thu thực',
        data: monthlyNet,
        backgroundColor: 'rgba(82, 196, 26, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Giảm giá',
        data: monthlyDiscounts,
        backgroundColor: 'rgba(250, 173, 20, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Số đơn hàng',
        data: monthlyOrders,
        backgroundColor: 'rgba(114, 46, 209, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y1',
      }
    ]
  };
};

export const createBestSellersChartData = (bestSellers) => {
  const bestSellerLabels = Array.isArray(bestSellers?.best_sellers) ? bestSellers.best_sellers.map(p => p.product_name) : [];
  const bestSellerQty = Array.isArray(bestSellers?.best_sellers) ? bestSellers.best_sellers.map(p => p.total_quantity) : [];

  return {
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
};

export const createProfitDistributionData = (profitAnalysis) => {
  return {
    labels: ['Lãi gộp', 'Vốn hàng bán'],
    datasets: [{
      data: [
        profitAnalysis?.profit?.gross_profit || 0,
        profitAnalysis?.cost_of_goods_sold?.total_cost || 0
      ],
      backgroundColor: ['#52c41a', '#ff4d4f'],
      borderWidth: 0,
      cutout: '60%',
    }]
  };
};

export const createTurnoverChartData = (inventoryTurnover) => {
  const turnoverLabels = Array.isArray(inventoryTurnover?.inventory_turnover) ? inventoryTurnover.inventory_turnover.map(p => p.product_name) : [];
  const turnoverRates = Array.isArray(inventoryTurnover?.inventory_turnover) ? inventoryTurnover.inventory_turnover.map(p => p.turnover_rate) : [];

  return {
    labels: turnoverLabels.slice(0, 8),
    datasets: [{
      label: 'Tỷ lệ luân chuyển',
      data: turnoverRates.slice(0, 8),
      backgroundColor: turnoverRates.map(rate => {
        if (rate > 100) return 'rgba(82, 196, 26, 0.8)'; // Xanh lá - Rất tốt
        if (rate > 50) return 'rgba(24, 144, 255, 0.8)'; // Xanh dương - Tốt
        if (rate > 20) return 'rgba(250, 173, 20, 0.8)'; // Cam - Trung bình
        return 'rgba(255, 77, 79, 0.8)'; // Đỏ - Cần cải thiện
      }),
      borderRadius: 6,
    }]
  };
};

export const createReturnProductChartData = (returnSummary) => {
  const returnSummaryData = returnSummary?.product_analysis || [];
  const returnProductLabels = Array.isArray(returnSummaryData) ? returnSummaryData.map(p => p.product_name) : [];
  const returnQuantities = Array.isArray(returnSummaryData) ? returnSummaryData.map(p => p.total_returned_quantity) : [];

  return {
    labels: returnProductLabels.slice(0, 8),
    datasets: [{
      label: 'Số lượng trả',
      data: returnQuantities.slice(0, 8),
      backgroundColor: 'rgba(255, 77, 79, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createWarrantyProductChartData = (warrantySummary) => {
  const warrantySummaryData = warrantySummary?.product_analysis || [];
  const warrantyProductLabels = Array.isArray(warrantySummaryData) ? warrantySummaryData.map(p => p.product_name) : [];
  const warrantyClaims = Array.isArray(warrantySummaryData) ? warrantySummaryData.map(p => p.total_claims) : [];

  return {
    labels: warrantyProductLabels.slice(0, 8),
    datasets: [{
      label: 'Số lần bảo hành',
      data: warrantyClaims.slice(0, 8),
      backgroundColor: 'rgba(24, 144, 255, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createFinancialChartData = (financialImpact) => {
  const financialSummary = financialImpact?.financial_summary || {};

  return {
    labels: ['Doanh thu', 'Tiền hoàn', 'Chi phí sửa chữa', 'Lợi nhuận ròng'],
    datasets: [{
      label: 'Số tiền (VNĐ)',
      data: [
        financialSummary.total_revenue || 0,
        financialSummary.total_refund_amount || 0,
        financialSummary.total_repair_cost || 0,
        financialSummary.net_profit || 0
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
};

export const createProfitChartData = (profitAnalysis) => {
  const profitAnalysisData = profitAnalysis?.product_profit_analysis || [];
  const profitLabels = Array.isArray(profitAnalysisData) ? profitAnalysisData.map(p => p.product_name) : [];
  const profitNetProfit = Array.isArray(profitAnalysisData) ? profitAnalysisData.map(p => p.net_profit) : [];

  return {
    labels: profitLabels.slice(0, 8),
    datasets: [{
      label: 'Lợi nhuận (VNĐ)',
      data: profitNetProfit.slice(0, 8),
      backgroundColor: 'rgba(0, 150, 136, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createTopProductsChartData = (topProducts) => {
  const topProductLabels = Array.isArray(topProducts?.top_products) ? topProducts.top_products.map(p => p.product_name) : [];
  const topProductRevenue = Array.isArray(topProducts?.top_products) ? topProducts.top_products.map(p => p.total_revenue) : [];

  return {
    labels: topProductLabels.slice(0, 8),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: topProductRevenue.slice(0, 8),
      backgroundColor: 'rgba(24, 144, 255, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createTopCustomersChartData = (topCustomers) => {
  const topCustomerLabels = Array.isArray(topCustomers) ? topCustomers.map(c => `${c.first_name} ${c.last_name}`) : [];
  const topCustomerSpent = Array.isArray(topCustomers) ? topCustomers.map(c => c.total_spent) : [];

  return {
    labels: topCustomerLabels.slice(0, 8),
    datasets: [{
      label: 'Tổng chi tiêu (VNĐ)',
      data: topCustomerSpent.slice(0, 8),
      backgroundColor: 'rgba(82, 196, 26, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createBestSellingChartData = (bestSelling) => {
  const bestSellingLabels = Array.isArray(bestSelling) ? bestSelling.map(p => p.product_name) : [];
  const bestSellingRevenue = Array.isArray(bestSelling) ? bestSelling.map(p => p.total_revenue) : [];

  return {
    labels: bestSellingLabels.slice(0, 8),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: bestSellingRevenue.slice(0, 8),
      backgroundColor: 'rgba(250, 173, 20, 0.8)',
      borderRadius: 6,
    }]
  };
};

export const createProductPerformanceChartData = (productPerformance) => {
  const performanceLabels = Array.isArray(productPerformance?.daily_performance) ? productPerformance.daily_performance.map(p => p.date) : [];
  const performanceQty = Array.isArray(productPerformance?.daily_performance) ? productPerformance.daily_performance.map(p => p.quantity) : [];
  const performanceRevenue = Array.isArray(productPerformance?.daily_performance) ? productPerformance.daily_performance.map(p => p.revenue) : [];

  return {
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
        label: 'Doanh thu (VNĐ)',
        data: performanceRevenue,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };
}; 