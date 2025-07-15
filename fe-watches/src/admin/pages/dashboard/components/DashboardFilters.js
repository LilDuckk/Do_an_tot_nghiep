import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { STORE_ENDPOINTS } from '@/config/api';

const DashboardFilters = ({ 
  period, 
  setPeriod, 
  dateRange, 
  setDateRange, 
  periodOptions,
  storeId,
  setStoreId,
  resetFilters,
  loading = false
}) => {
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setStoresLoading(true);
        const token = localStorage.getItem('accessToken');
        const response = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStores([]);
      } finally {
        setStoresLoading(false);
      }
    };

    fetchStores();
  }, []);

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
        <div className="filter-item">
          <label className="filter-label">Cửa hàng</label>
          <Select
            value={storeId}
            onChange={setStoreId}
            className="filter-select"
            placeholder="Chọn cửa hàng"
            allowClear
            loading={storesLoading}
            options={[
              { value: '', label: 'Tất cả cửa hàng' },
              ...stores.map(store => ({
                value: store.id.toString(),
                label: store.name
              }))
            ]}
          />
        </div>
        <div className="filter-item">
          <Button 
            type="default" 
            icon={<ReloadOutlined />}
            onClick={resetFilters}
            className="filter-reset-btn"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Reset'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters; 