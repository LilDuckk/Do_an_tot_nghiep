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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

const PromotionManage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'add'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [newPromotionTemplate, setNewPromotionTemplate] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: '',
    endDate: '',
    status: 'active',
    usageLimit: 0,
    usedCount: 0,
    isPublic: true,
    applicableProducts: [],
    applicableCategories: [],
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/promotions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách khuyến mãi');
      }

      const data = await response.json();
      setPromotions(data);
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

  const handleOpenDialog = (type, promotion = null) => {
    setDialogType(type);
    if (type === 'add') {
      setSelectedPromotion(newPromotionTemplate);
    } else {
      setSelectedPromotion(promotion);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromotion(null);
    setDialogType('');
  };

  const handleInputChange = (field, value) => {
    setSelectedPromotion({
      ...selectedPromotion,
      [field]: value,
    });
  };

  const handleSavePromotion = async () => {
    try {
      const url = dialogType === 'add'
        ? 'http://localhost:8080/api/admin/promotions'
        : `http://localhost:8080/api/admin/promotions/${selectedPromotion.id}`;

      const method = dialogType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(selectedPromotion),
      });

      if (!response.ok) {
        throw new Error(`Không thể ${dialogType === 'add' ? 'thêm' : 'cập nhật'} khuyến mãi`);
      }

      showSnackbar(`${dialogType === 'add' ? 'Thêm' : 'Cập nhật'} khuyến mãi thành công`, 'success');
      fetchPromotions();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeletePromotion = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/promotions/${selectedPromotion.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa khuyến mãi');
      }

      showSnackbar('Xóa khuyến mãi thành công', 'success');
      fetchPromotions();
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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return 'Phần trăm';
      case 'fixed':
        return 'Số tiền cố định';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'expired':
        return 'Đã hết hạn';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
          Quản lý khuyến mãi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Thêm khuyến mãi
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
              <TableCell>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá trị</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>{promotion.code}</TableCell>
                  <TableCell>{promotion.name}</TableCell>
                  <TableCell>{getTypeLabel(promotion.type)}</TableCell>
                  <TableCell>
                    {promotion.type === 'percentage'
                      ? `${promotion.value}%`
                      : formatCurrency(promotion.value)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(promotion.status)}
                      color={getStatusColor(promotion.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(promotion.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('view', promotion)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('edit', promotion)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDialog('delete', promotion)}
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
          count={promotions.length}
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
        {selectedPromotion && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon color="primary" />
                {selectedPromotion.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Mã khuyến mãi:</Typography>
                  <Typography>{selectedPromotion.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Loại:</Typography>
                  <Typography>{getTypeLabel(selectedPromotion.type)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Giá trị:</Typography>
                  <Typography>
                    {selectedPromotion.type === 'percentage'
                      ? `${selectedPromotion.value}%`
                      : formatCurrency(selectedPromotion.value)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Trạng thái:</Typography>
                  <Chip
                    label={getStatusLabel(selectedPromotion.status)}
                    color={getStatusColor(selectedPromotion.status)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Thời gian bắt đầu:</Typography>
                  <Typography>
                    {new Date(selectedPromotion.startDate).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Thời gian kết thúc:</Typography>
                  <Typography>
                    {new Date(selectedPromotion.endDate).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Đơn hàng tối thiểu:</Typography>
                  <Typography>{formatCurrency(selectedPromotion.minOrderAmount)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Giảm giá tối đa:</Typography>
                  <Typography>{formatCurrency(selectedPromotion.maxDiscountAmount)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Giới hạn sử dụng:</Typography>
                  <Typography>
                    {selectedPromotion.usageLimit === 0
                      ? 'Không giới hạn'
                      : `${selectedPromotion.usedCount}/${selectedPromotion.usageLimit}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Công khai:</Typography>
                  <Typography>{selectedPromotion.isPublic ? 'Có' : 'Không'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Mô tả:</Typography>
                  <Typography>{selectedPromotion.description}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit/Add Dialog */}
      <Dialog
        open={openDialog && (dialogType === 'edit' || dialogType === 'add')}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPromotion && (
          <>
            <DialogTitle>
              {dialogType === 'add' ? 'Thêm khuyến mãi mới' : 'Chỉnh sửa khuyến mãi'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mã khuyến mãi"
                    value={selectedPromotion.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên khuyến mãi"
                    value={selectedPromotion.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={2}
                    value={selectedPromotion.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={selectedPromotion.type}
                      label="Loại"
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <MenuItem value="percentage">Phần trăm</MenuItem>
                      <MenuItem value="fixed">Số tiền cố định</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giá trị"
                    type="number"
                    value={selectedPromotion.value}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {selectedPromotion.type === 'percentage' ? '%' : '₫'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Đơn hàng tối thiểu"
                    type="number"
                    value={selectedPromotion.minOrderAmount}
                    onChange={(e) =>
                      handleInputChange('minOrderAmount', parseFloat(e.target.value))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giảm giá tối đa"
                    type="number"
                    value={selectedPromotion.maxDiscountAmount}
                    onChange={(e) =>
                      handleInputChange('maxDiscountAmount', parseFloat(e.target.value))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian bắt đầu"
                    type="datetime-local"
                    value={selectedPromotion.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian kết thúc"
                    type="datetime-local"
                    value={selectedPromotion.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giới hạn sử dụng"
                    type="number"
                    value={selectedPromotion.usageLimit}
                    onChange={(e) =>
                      handleInputChange('usageLimit', parseInt(e.target.value))
                    }
                    helperText="0 = không giới hạn"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={selectedPromotion.status}
                      label="Trạng thái"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="active">Đang hoạt động</MenuItem>
                      <MenuItem value="inactive">Không hoạt động</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedPromotion.isPublic}
                        onChange={(e) =>
                          handleInputChange('isPublic', e.target.checked)
                        }
                      />
                    }
                    label="Công khai"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePromotion}
              >
                {dialogType === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
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
            Bạn có chắc chắn muốn xóa khuyến mãi này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePromotion}
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

export default PromotionManage; 