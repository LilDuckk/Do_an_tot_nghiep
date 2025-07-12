import React from 'react';
import { DatePicker, Select } from 'antd';

const DashboardFilters = ({ 
  period, 
  setPeriod, 
  dateRange, 
  setDateRange, 
  periodOptions 
}) => {
  return (
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
  );
};

export default DashboardFilters; 