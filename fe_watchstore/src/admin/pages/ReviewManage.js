import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';

const ReviewManage = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      fetchReviews();
      handleCloseDialog();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      fetchReviews();
      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý đánh giá sản phẩm
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Người đánh giá</TableCell>
                <TableCell>Đánh giá</TableCell>
                <TableCell>Ngày đánh giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.productName}</TableCell>
                    <TableCell>{review.userName}</TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly />
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(review.status)}
                        color={getStatusColor(review.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewReview(review)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {review.status === 'PENDING' && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleApproveReview(review.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleRejectReview(review.id)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {reviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có đánh giá nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      {selectedReview.userName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedReview.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedReview.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sản phẩm: {selectedReview.productName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography component="legend">Đánh giá:</Typography>
                    <Rating value={selectedReview.rating} readOnly />
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedReview.comment}
                  </Typography>
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Hình ảnh:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedReview.images.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={image}
                            alt={`Hình ảnh ${index + 1}`}
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedReview.status === 'PENDING' && (
                <>
                  <Button
                    color="success"
                    onClick={() => handleApproveReview(selectedReview.id)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleRejectReview(selectedReview.id)}
                  >
                    Từ chối
                  </Button>
                </>
              )}
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ReviewManage; 