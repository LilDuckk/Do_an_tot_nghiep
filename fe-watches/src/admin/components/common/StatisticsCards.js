import React from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';

const StatisticsCards = ({ config, loading }) => {
  // Tách config thành 2 rows: 4 cards đầu và các cards còn lại
  const firstRow = config.slice(0, 4);
  const secondRow = config.slice(4);

  return (
    <div>
      {/* First row - 4 cards */}
      <Row gutter={[16, 16]} className="admin-statistics-section">
        {firstRow.map((card, index) => (
          <Col xs={24} sm={6} key={index}>
            <Card className={`admin-statistics-card ${card.cardType || 'info'}`}>
              <Statistic
                title={card.title}
                value={card.value}
                suffix={card.suffix}
                formatter={card.formatter}
                valueStyle={card.valueStyle}
                prefix={card.prefix}
              />
              {card.extra && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {card.extra}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Second row - remaining cards */}
      {secondRow.length > 0 && (
        <Row gutter={[16, 16]} className="admin-statistics-section">
          {secondRow.map((card, index) => (
            <Col xs={24} sm={12} key={index}>
              <Card className={`admin-statistics-card ${card.cardType || 'info'}`}>
                <Statistic
                  title={card.title}
                  value={card.value}
                  suffix={card.suffix}
                  formatter={card.formatter}
                  valueStyle={card.valueStyle}
                  prefix={card.prefix}
                />
                {card.extra && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {card.extra}
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {loading && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default StatisticsCards; 