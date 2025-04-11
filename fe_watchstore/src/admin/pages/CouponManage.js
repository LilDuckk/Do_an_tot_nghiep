import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CouponManage = () => {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
    description: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/coupons', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleOpen = (coupon = null) => {
    if (coupon) {
      setSelectedCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        startDate: coupon.startDate.split('T')[0],
        endDate: coupon.endDate.split('T')[0],
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        description: coupon.description || '',
      });
    } else {
      setSelectedCoupon(null);
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true,
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCoupon(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedCoupon
        ? `http://localhost:8080/api/coupons/${selectedCoupon.id}`
        : 'http://localhost:8080/api/coupons';
      const method = selectedCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCoupons();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/coupons/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (response.ok) {
          fetchCoupons();
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDiscountText = (coupon) => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}%`;
    }
    return `${coupon.value.toLocaleString('vi-VN')}đ`;
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý mã giảm giá
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Thêm mã giảm giá mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã</TableCell>
              <TableCell>Giảm giá</TableCell>
              <TableCell>Đơn tối thiểu</TableCell>
              <TableCell>Giảm tối đa</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Giới hạn sử dụng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.code}</TableCell>
                <TableCell>{getDiscountText(coupon)}</TableCell>
                <TableCell>
                  {coupon.minPurchase
                    ? `${coupon.minPurchase.toLocaleString('vi-VN')}đ`
                    : 'Không có'}
                </TableCell>
                <TableCell>
                  {coupon.maxDiscount
                    ? `${coupon.maxDiscount.toLocaleString('vi-VN')}đ`
                    : 'Không có'}
                </TableCell>
                <TableCell>{formatDate(coupon.startDate)}</TableCell>
                <TableCell>{formatDate(coupon.endDate)}</TableCell>
                <TableCell>
                  {coupon.usageLimit ? `${coupon.usageLimit} lần` : 'Không giới hạn'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      isExpired(coupon.endDate)
                        ? 'Hết hạn'
                        : coupon.isActive
                        ? 'Đang hoạt động'
                        : 'Đã tắt'
                    }
                    color={
                      isExpired(coupon.endDate)
                        ? 'error'
                        : coupon.isActive
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(coupon)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(coupon.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã giảm giá"
                name="code"
                value={formData.code}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại giảm giá"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <MenuItem value="PERCENTAGE">Phần trăm</MenuItem>
                <MenuItem value="FIXED">Số tiền cố định</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.type === 'PERCENTAGE' ? 'Phần trăm giảm' : 'Số tiền giảm'}
                name="value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                InputProps={{
                  endAdornment: formData.type === 'PERCENTAGE' ? '%' : 'đ',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Đơn hàng tối thiểu"
                name="minPurchase"
                type="number"
                value={formData.minPurchase}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'đ',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giảm tối đa"
                name="maxDiscount"
                type="number"
                value={formData.maxDiscount}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'đ',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giới hạn sử dụng"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleChange}
                InputProps={{
                  endAdornment: 'lần',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Đang hoạt động"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCoupon ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouponManage; 