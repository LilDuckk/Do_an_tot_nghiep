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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

const NotificationManage = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'SYSTEM',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    scheduledDate: new Date(),
    isScheduled: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      setSelectedNotification(notification);
      setFormData({
        title: notification.title,
        content: notification.content,
        type: notification.type,
        priority: notification.priority,
        targetAudience: notification.targetAudience,
        scheduledDate: new Date(notification.scheduledDate),
        isScheduled: notification.isScheduled,
        isActive: notification.isActive,
      });
    } else {
      setSelectedNotification(null);
      setFormData({
        title: '',
        content: '',
        type: 'SYSTEM',
        priority: 'NORMAL',
        targetAudience: 'ALL',
        scheduledDate: new Date(),
        isScheduled: false,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      scheduledDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedNotification
        ? `http://localhost:8080/api/admin/notifications/${selectedNotification.id}`
        : 'http://localhost:8080/api/admin/notifications';
      const method = selectedNotification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchNotifications();
        handleCloseDialog();
      } else {
        console.error('Error saving notification');
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleSendNotification = async (notificationId) => {
    try {
      await fetch(`http://localhost:8080/api/admin/notifications/${notificationId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SYSTEM':
        return 'info';
      case 'PROMOTION':
        return 'success';
      case 'ALERT':
        return 'error';
      case 'UPDATE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'SYSTEM':
        return 'Hệ thống';
      case 'PROMOTION':
        return 'Khuyến mãi';
      case 'ALERT':
        return 'Cảnh báo';
      case 'UPDATE':
        return 'Cập nhật';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'NORMAL':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Cao';
      case 'NORMAL':
        return 'Thường';
      case 'LOW':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const getTargetAudienceText = (target) => {
    switch (target) {
      case 'ALL':
        return 'Tất cả';
      case 'CUSTOMERS':
        return 'Khách hàng';
      case 'ADMINS':
        return 'Quản trị viên';
      default:
        return target;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý thông báo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm thông báo
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Độ ưu tiên</TableCell>
                <TableCell>Đối tượng</TableCell>
                <TableCell>Ngày lên lịch</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeText(item.type)}
                        color={getTypeColor(item.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityText(item.priority)}
                        color={getPriorityColor(item.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getTargetAudienceText(item.targetAudience)}</TableCell>
                    <TableCell>{formatDate(item.scheduledDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                        color={item.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleSendNotification(item.id)}
                      >
                        <SendIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteNotification(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có thông báo nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={notifications.length}
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
        <DialogTitle>
          {selectedNotification ? 'Chỉnh sửa thông báo' : 'Thêm thông báo mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nội dung"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại thông báo</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Loại thông báo"
                  >
                    <MenuItem value="SYSTEM">Hệ thống</MenuItem>
                    <MenuItem value="PROMOTION">Khuyến mãi</MenuItem>
                    <MenuItem value="ALERT">Cảnh báo</MenuItem>
                    <MenuItem value="UPDATE">Cập nhật</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="HIGH">Cao</MenuItem>
                    <MenuItem value="NORMAL">Thường</MenuItem>
                    <MenuItem value="LOW">Thấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Đối tượng nhận</InputLabel>
                  <Select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    label="Đối tượng nhận"
                  >
                    <MenuItem value="ALL">Tất cả</MenuItem>
                    <MenuItem value="CUSTOMERS">Khách hàng</MenuItem>
                    <MenuItem value="ADMINS">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={vi}
                >
                  <DatePicker
                    label="Ngày lên lịch"
                    value={formData.scheduledDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isScheduled}
                      onChange={handleChange}
                      name="isScheduled"
                    />
                  }
                  label="Lên lịch gửi"
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedNotification ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationManage; 