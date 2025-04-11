import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const ReviewManage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'delete'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách đánh giá');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (type, review) => {
    setDialogType(type);
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
    setDialogType('');
  };

  const handleUpdateReview = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật đánh giá');
      }

      showSnackbar('Cập nhật đánh giá thành công', 'success');
      fetchReviews();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeleteReview = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/reviews/${selectedReview.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa đánh giá');
      }

      showSnackbar('Xóa đánh giá thành công', 'success');
      fetchReviews();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý đánh giá
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchReviews()}
        >
          Làm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.product.name}</TableCell>
                  <TableCell>{review.user.fullName}</TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly />
                  </TableCell>
                  <TableCell>
                    {review.content.length > 50
                      ? `${review.content.substring(0, 50)}...`
                      : review.content}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(review.status)}
                      color={getStatusColor(review.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('view', review)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('edit', review)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDialog('delete', review)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
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
      </TableContainer>

      {/* View Dialog */}
      <Dialog
        open={openDialog && dialogType === 'view'}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Sản phẩm:</Typography>
                <Typography>{selectedReview.product.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Người dùng:</Typography>
                <Typography>{selectedReview.user.fullName}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Đánh giá:</Typography>
                <Rating value={selectedReview.rating} readOnly />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Nội dung:</Typography>
                <Typography>{selectedReview.content}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Trạng thái:</Typography>
                <Chip
                  label={getStatusLabel(selectedReview.status)}
                  color={getStatusColor(selectedReview.status)}
                />
              </Box>
              <Box>
                <Typography variant="subtitle1">Ngày tạo:</Typography>
                <Typography>
                  {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog && dialogType === 'edit'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Sản phẩm:</Typography>
                <Typography>{selectedReview.product.name}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Người dùng:</Typography>
                <Typography>{selectedReview.user.fullName}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Đánh giá:</Typography>
                <Rating
                  value={selectedReview.rating}
                  onChange={(event, newValue) => {
                    setSelectedReview({
                      ...selectedReview,
                      rating: newValue,
                    });
                  }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Nội dung:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={selectedReview.content}
                  onChange={(e) =>
                    setSelectedReview({
                      ...selectedReview,
                      content: e.target.value,
                    })
                  }
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Trạng thái:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant={selectedReview.status === 'approved' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      setSelectedReview({
                        ...selectedReview,
                        status: 'approved',
                      })
                    }
                  >
                    Duyệt
                  </Button>
                  <Button
                    variant={selectedReview.status === 'rejected' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() =>
                      setSelectedReview({
                        ...selectedReview,
                        status: 'rejected',
                      })
                    }
                  >
                    Từ chối
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUpdateReview(selectedReview)}
              >
                Lưu thay đổi
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDialog && dialogType === 'delete'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa đánh giá này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteReview}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReviewManage; 