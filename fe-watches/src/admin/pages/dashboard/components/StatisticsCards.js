import React from 'react';
import { Row, Col } from 'antd';
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
import { formatVND } from '@/admin/utils/formatters';

const StatisticsCards = ({ 
  overview, 
  dailyRevenue, 
  returnSummary, 
  warrantySummary, 
  profitAnalysis, 
  dataReady 
}) => {
  if (!dataReady) return null;

  // Mini statistics cards data
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

  // Profit analysis cards
  const profitStats = [
    {
      title: 'Doanh thu ròng',
      value: profitAnalysis?.revenue?.net_revenue || 0,
      suffix: '₫',
      icon: <ArrowUpOutlined />,
      color: '#1890ff',
      subtitle: 'Sau khi trừ giảm giá',
    },
    {
      title: 'Lợi nhuận/đơn',
      value: profitAnalysis?.profit?.profit_per_order || 0,
      suffix: '₫',
      icon: <ShoppingCartOutlined />,
      color: '#722ed1',
      subtitle: 'Trung bình mỗi đơn hàng',
    },
    {
      title: 'Tổng giảm giá',
      value: profitAnalysis?.revenue?.total_discounts || 0,
      suffix: '₫',
      icon: <ArrowDownOutlined />,
      color: '#ff4d4f',
      percentage: profitAnalysis?.revenue?.discount_rate || 0,
    },
    {
      title: 'Biên lợi nhuận',
      value: profitAnalysis?.profit?.gross_profit_margin || 0,
      suffix: '%',
      icon: <PercentageOutlined />,
      color: '#faad14',
      subtitle: 'Tỷ lệ lợi nhuận gộp',
    },
  ];

  const renderStatCard = (stat, cardClass) => (
    <Col xs={24} sm={12} lg={6} key={stat.title}>
      <div className={cardClass}>
        <div className={`${cardClass}-title`}>
          {stat.title}
        </div>
        <div className={`${cardClass}-value`} style={{color: stat.color}}>
          {formatVND(stat.value)}{stat.suffix}
        </div>
        {stat.subtitle && (
          <div className={`${cardClass}-subtitle`}>
            {stat.subtitle}
          </div>
        )}
        {stat.growth !== undefined && (
          <div className={`${cardClass}-growth ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
            {stat.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(stat.growth)}%
          </div>
        )}
        {stat.percentage !== undefined && (
          <div className={`${cardClass}-percentage`}>
            {stat.percentage}%
          </div>
        )}
      </div>
    </Col>
  );

  const renderProfitStatCard = (stat) => (
    <Col xs={24} sm={12} lg={6} key={stat.title}>
      <div className="profit-stat-card">
        <div className="profit-stat-title">
          {stat.title}
        </div>
        <div className="profit-stat-value" style={{color: stat.color}}>
          {formatVND(stat.value)}{stat.suffix}
        </div>
        {stat.subtitle && (
          <div className="profit-stat-subtitle">
            {stat.subtitle}
          </div>
        )}
        {stat.percentage !== undefined && (
          <div className="profit-stat-percentage">
            {stat.percentage}%
          </div>
        )}
      </div>
    </Col>
  );

  return (
    <>
      {/* Mini Statistics Cards */}
      <div className="dashboard-chart-container mini-stats-container">
        <div className="dashboard-table-title">Thống kê chi tiết doanh thu</div>
        <Row gutter={[16, 16]}>
          {miniStats.map((stat) => renderStatCard(stat, 'mini-stat'))}
        </Row>
      </div>

      {/* Profit Analysis Cards */}
      <div className="dashboard-chart-container profit-stats-container">
        <div className="dashboard-table-title">
          Phân tích lợi nhuận
          {profitAnalysis?.period && (
            <span className="profit-period-badge">
              Từ {new Date(profitAnalysis.period.start_date).toLocaleDateString('vi-VN')} 
              đến {new Date(profitAnalysis.period.end_date).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <Row gutter={[16, 16]}>
          {profitStats.map((stat) => renderProfitStatCard(stat))}
        </Row>
      </div>

      {/* Return Orders Statistics Cards */}
      <div className="dashboard-chart-container return-stats-container">
        <div className="dashboard-table-title">Thống kê trả hàng</div>
        <Row gutter={[16, 16]}>
          {returnStats.map((stat) => renderStatCard(stat, 'return-stat'))}
        </Row>
      </div>

      {/* Warranty Statistics Cards */}
      <div className="dashboard-chart-container warranty-stats-container">
        <div className="dashboard-table-title">Thống kê bảo hành</div>
        <Row gutter={[16, 16]}>
          {warrantyStats.map((stat) => renderStatCard(stat, 'warranty-stat'))}
        </Row>
      </div>
    </>
  );
};

export default StatisticsCards; 