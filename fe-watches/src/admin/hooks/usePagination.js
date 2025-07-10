import { useState, useCallback, useMemo } from 'react';

/**
 * Hook quản lý phân trang chung
 * @param {number} initialPageSize - Số item mỗi trang mặc định
 * @param {number} initialPage - Trang hiện tại mặc định
 * @returns {object} - Các state và function để quản lý pagination
 */
export const usePagination = (initialPageSize = 20, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  /**
   * Tính toán tổng số trang dựa trên total và pageSize
   * @param {number} totalCount - Tổng số item
   * @param {number} itemsPerPage - Số item mỗi trang
   */
  const calculateTotalPages = useCallback((totalCount, itemsPerPage = pageSize) => {
    if (totalCount === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    }
  }, [pageSize]);

  /**
   * Parse API response và cập nhật pagination
   * @param {object} apiResponse - Response từ API có cấu trúc {count, results, next, previous}
   * @param {number} itemsPerPage - Số item mỗi trang
   */
  const parseApiResponse = useCallback((apiResponse, itemsPerPage = pageSize) => {
    if (!apiResponse) {
      setTotal(0);
      setTotalPages(1);
      setHasNext(false);
      setHasPrevious(false);
      return;
    }

    const count = apiResponse.count || 0;
    const next = apiResponse.next;
    const previous = apiResponse.previous;

    setTotal(count);
    calculateTotalPages(count, itemsPerPage);
    setHasNext(!!next);
    setHasPrevious(!!previous);

    // Reset về trang 1 nếu không có dữ liệu và đang ở trang khác 1
    if (count === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, pageSize, calculateTotalPages]);

  /**
   * Cập nhật thông tin pagination
   * @param {number} totalCount - Tổng số item
   * @param {number} itemsPerPage - Số item mỗi trang
   */
  const updatePagination = useCallback((totalCount, itemsPerPage = pageSize) => {
    setTotal(totalCount);
    calculateTotalPages(totalCount, itemsPerPage);
    
    // Reset về trang 1 nếu không có dữ liệu và đang ở trang khác 1
    if (totalCount === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, pageSize, calculateTotalPages]);

  /**
   * Thay đổi trang
   * @param {number} page - Số trang mới
   */
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  /**
   * Thay đổi số item mỗi trang
   * @param {number} size - Số item mỗi trang mới
   */
  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi pageSize
  }, []);

  /**
   * Reset về trang đầu tiên
   */
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  /**
   * Chuyển đến trang trước
   */
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  /**
   * Chuyển đến trang sau
   */
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  /**
   * Kiểm tra có thể chuyển đến trang trước không
   */
  const canGoPrevious = useMemo(() => currentPage > 1 && hasPrevious, [currentPage, hasPrevious]);

  /**
   * Kiểm tra có thể chuyển đến trang sau không
   */
  const canGoNext = useMemo(() => currentPage < totalPages && hasNext, [currentPage, totalPages, hasNext]);

  /**
   * Render pagination component
   * @param {boolean} hasAccess - Có quyền truy cập không
   * @param {function} onPageChange - Callback khi thay đổi trang (tùy chọn)
   * @returns {JSX.Element} - Pagination component
   */
  const renderPagination = useCallback((hasAccess = true, onPageChange = null) => {
    const handlePageClick = onPageChange || handlePageChange;
    const handlePreviousClick = onPageChange ? () => onPageChange(currentPage - 1) : goToPreviousPage;
    const handleNextClick = onPageChange ? () => onPageChange(currentPage + 1) : goToNextPage;

    if (total === 0) {
      return (
        <div className="admin-pagination">
          <button disabled>Trước</button>
          <div className="page-numbers"><button className="active" disabled>1</button></div>
          <button disabled>Sau</button>
          <span className="page-info">Trang 1 / 1</span>
        </div>
      );
    }

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i || !hasAccess}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="admin-pagination">
        <button 
          onClick={handlePreviousClick} 
          disabled={!canGoPrevious || !hasAccess}
        >
          Trước
        </button>
        <div className="page-numbers">{pages}</div>
        <button 
          onClick={handleNextClick} 
          disabled={!canGoNext || !hasAccess}
        >
          Sau
        </button>
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  }, [currentPage, totalPages, total, handlePageChange, goToPreviousPage, goToNextPage, canGoPrevious, canGoNext]);

  return {
    // States
    currentPage,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    
    // Setters
    setCurrentPage,
    setPageSize,
    setTotal,
    setTotalPages,
    
    // Functions
    calculateTotalPages,
    parseApiResponse,
    updatePagination,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage,
    goToPreviousPage,
    goToNextPage,
    renderPagination,
    
    // Computed
    canGoPrevious,
    canGoNext
  };
}; 