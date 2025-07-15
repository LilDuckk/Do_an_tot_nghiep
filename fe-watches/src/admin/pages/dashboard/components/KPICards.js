import React from 'react';
import { Row, Col } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  BarChartOutlined,
  InboxOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { formatVND } from '@/admin/utils/formatters';

const KPICards = ({ overview, dataReady }) => {
  if (!dataReady) return null;

  return (
    <>
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
    </>
  );
};

export default KPICards; 