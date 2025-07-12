import React from 'react';
import { Badge, Button, Popover } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';

const getAlertLevelClass = (severity) => {
  if (severity === 'error' || severity === 'danger') return 'alert-level-high';
  if (severity === 'warning') return 'alert-level-medium';
  if (severity === 'info') return 'alert-level-low';
  return '';
};

const getAlertIcon = (type, severity) => {
  if (severity === 'error' || severity === 'danger') return <ExclamationCircleOutlined style={{color:'#ff4d4f'}} />;
  if (severity === 'warning') return <WarningOutlined style={{color:'#faad14'}} />;
  if (severity === 'info') return <InfoCircleOutlined style={{color:'#52c41a'}} />;
  return <AlertOutlined style={{color:'#1890ff'}} />;
};

const AlertsButton = (props) => {
  let safeAlerts = [];
  if (Array.isArray(props.alerts)) {
    safeAlerts = props.alerts;
  } else if (props.alerts && Array.isArray(props.alerts.alerts)) {
    safeAlerts = props.alerts.alerts;
  }
  const totalAlerts = safeAlerts.length;
  if (totalAlerts === 0) return null;

  return (
    <div className="alerts-button-container">
      <Popover
        content={
          <div className="alerts-popover-content">
            <div className="alerts-popover-header">
              <AlertOutlined className="alerts-icon" />
              Cảnh báo hệ thống
            </div>
            <div className="alerts-list">
              {safeAlerts.map((alert, index) => (
                <div key={index} className={`alert-item ${getAlertLevelClass(alert.severity)}`}>
                  <div className="alert-title" style={{display:'flex',alignItems:'center',gap:6}}>
                    {getAlertIcon(alert.type, alert.severity)}
                    {alert.title || 'Cảnh báo'}
                  </div>
                  <div className="alert-message">
                    {alert.message}
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
        onOpenChange={props.setAlertsVisible}
      >
        <Badge count={totalAlerts} size="small">
          <Button
            type="primary"
            danger
            shape="circle"
            size="large"
            icon={<AlertOutlined />}
            className={`alerts-button ${props.alertsVisible ? 'alerts-button-active' : ''}`}
          />
        </Badge>
      </Popover>
      <div className="alerts-label">
        Cảnh báo
      </div>
    </div>
  );
};

export default AlertsButton; 