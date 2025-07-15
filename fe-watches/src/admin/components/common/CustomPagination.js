import React from 'react';

/**
 * Component phân trang tùy chỉnh
 * @param {object} props - Props của component
 * @param {number} props.currentPage - Trang hiện tại
 * @param {number} props.totalPages - Tổng số trang
 * @param {number} props.total - Tổng số item
 * @param {function} props.onPageChange - Callback khi thay đổi trang
 * @param {boolean} props.hasAccess - Có quyền truy cập không
 * @param {number} props.maxVisiblePages - Số trang tối đa hiển thị
 * @param {string} props.className - CSS class
 * @param {boolean} props.hasNext - Có trang tiếp theo không (từ API)
 * @param {boolean} props.hasPrevious - Có trang trước không (từ API)
 * @returns {JSX.Element} - CustomPagination component
 */
const CustomPagination = ({
  currentPage = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  hasAccess = true,
  maxVisiblePages = 5,
  className = 'admin-pagination',
  hasNext = false,
  hasPrevious = false
}) => {
  // Nếu không có dữ liệu, hiển thị pagination rỗng
  if (total === 0) {
    return (
      <div className={className}>
        <button disabled className="admin-btn">Trước</button>
        <div className="page-numbers">
          <button className="admin-btn active" disabled>1</button>
        </div>
        <button disabled className="admin-btn">Sau</button>
        <span className="page-info">Trang 1 / 1</span>
      </div>
    );
  }

  // Tính toán range trang hiển thị
  const getVisiblePages = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return { startPage, endPage };
  };

  const { startPage, endPage } = getVisiblePages();

  // Kiểm tra có thể chuyển trang dựa trên API response
  const canGoPrevious = currentPage > 1 && hasPrevious;
  const canGoNext = currentPage < totalPages && hasNext;

  // Render các nút trang
  const renderPageButtons = () => {
    const pages = [];

    // Nút trang đầu tiên
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => onPageChange(1)}
          className="admin-btn"
          disabled={!hasAccess}
        >
          1
        </button>
      );
      
      // Dấu ... nếu có khoảng trống
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    // Các trang trong range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`admin-btn ${currentPage === i ? 'active' : ''}`}
          disabled={currentPage === i || !hasAccess}
        >
          {i}
        </button>
      );
    }

    // Dấu ... nếu có khoảng trống
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis2" className="pagination-ellipsis">
          ...
        </span>
      );
    }

    // Nút trang cuối cùng
    if (endPage < totalPages) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="admin-btn"
          disabled={!hasAccess}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={className}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious || !hasAccess}
        className="admin-btn"
      >
        Trước
      </button>
      
      <div className="page-numbers">
        {renderPageButtons()}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || !hasAccess}
        className="admin-btn"
      >
        Sau
      </button>
      
      <span className="page-info">
        Trang {currentPage} / {totalPages}
      </span>
    </div>
  );
};

export default CustomPagination; 