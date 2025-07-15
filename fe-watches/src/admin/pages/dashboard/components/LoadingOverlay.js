import React from 'react';

const LoadingOverlay = ({ loading, initialLoading }) => {
  if (!loading && !initialLoading) return null;

  return (
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
  );
};

export default LoadingOverlay; 