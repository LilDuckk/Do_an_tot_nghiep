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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const NotificationManage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'add'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [newNotificationTemplate, setNewNotificationTemplate] = useState({
    title: '',
    content: '',
    type: 'info',
    target: 'all',
    status: 'draft',
    scheduledAt: null,
    isPushNotification: false,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách thông báo');
      }

      const data = await response.json();
      setNotifications(data);
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

  const handleOpenDialog = (type, notification = null) => {
    setDialogType(type);
    if (type === 'add') {
      setSelectedNotification(newNotificationTemplate);
    } else {
      setSelectedNotification(notification);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
    setDialogType('');
  };

  const handleInputChange = (field, value) => {
    setSelectedNotification({
      ...selectedNotification,
      [field]: value,
    });
  };

  const handleSaveNotification = async () => {
    try {
      const url = dialogType === 'add'
        ? 'http://localhost:8080/api/admin/notifications'
        : `http://localhost:8080/api/admin/notifications/${selectedNotification.id}`;

      const method = dialogType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(selectedNotification),
      });

      if (!response.ok) {
        throw new Error(`Không thể ${dialogType === 'add' ? 'thêm' : 'cập nhật'} thông báo`);
      }

      showSnackbar(`${dialogType === 'add' ? 'Thêm' : 'Cập nhật'} thông báo thành công`, 'success');
      fetchNotifications();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeleteNotification = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/notifications/${selectedNotification.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa thông báo');
      }

      showSnackbar('Xóa thông báo thành công', 'success');
      fetchNotifications();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/notifications/${selectedNotification.id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể gửi thông báo');
      }

      showSnackbar('Gửi thông báo thành công', 'success');
      fetchNotifications();
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'info':
        return 'Thông tin';
      case 'success':
        return 'Thành công';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'draft':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'sent':
        return 'Đã gửi';
      case 'draft':
        return 'Bản nháp';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'failed':
        return 'Gửi thất bại';
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
          Quản lý thông báo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Thêm thông báo
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
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Đối tượng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thời gian lên lịch</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.id}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(notification.type)}
                      color={getTypeColor(notification.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{notification.target}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(notification.status)}
                      color={getStatusColor(notification.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {notification.scheduledAt
                      ? new Date(notification.scheduledAt).toLocaleString('vi-VN')
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('view', notification)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('edit', notification)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleSendNotification(notification)}
                      disabled={notification.status === 'sent'}
                    >
                      <SendIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDialog('delete', notification)}
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
          count={notifications.length}
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
        {selectedNotification && (
          <>
            <DialogTitle>{selectedNotification.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Nội dung:</Typography>
                  <Typography>{selectedNotification.content}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Loại:</Typography>
                  <Chip
                    label={getTypeLabel(selectedNotification.type)}
                    color={getTypeColor(selectedNotification.type)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Đối tượng:</Typography>
                  <Typography>{selectedNotification.target}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Trạng thái:</Typography>
                  <Chip
                    label={getStatusLabel(selectedNotification.status)}
                    color={getStatusColor(selectedNotification.status)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Thời gian lên lịch:</Typography>
                  <Typography>
                    {selectedNotification.scheduledAt
                      ? new Date(selectedNotification.scheduledAt).toLocaleString('vi-VN')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Push Notification:</Typography>
                  <Typography>
                    {selectedNotification.isPushNotification ? 'Có' : 'Không'}
                  </Typography>
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
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              {dialogType === 'add' ? 'Thêm thông báo mới' : 'Chỉnh sửa thông báo'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề"
                    value={selectedNotification.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nội dung"
                    multiline
                    rows={4}
                    value={selectedNotification.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={selectedNotification.type}
                      label="Loại"
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <MenuItem value="info">Thông tin</MenuItem>
                      <MenuItem value="success">Thành công</MenuItem>
                      <MenuItem value="warning">Cảnh báo</MenuItem>
                      <MenuItem value="error">Lỗi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Đối tượng</InputLabel>
                    <Select
                      value={selectedNotification.target}
                      label="Đối tượng"
                      onChange={(e) => handleInputChange('target', e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="customers">Khách hàng</MenuItem>
                      <MenuItem value="admins">Quản trị viên</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian lên lịch"
                    type="datetime-local"
                    value={selectedNotification.scheduledAt || ''}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedNotification.isPushNotification}
                        onChange={(e) =>
                          handleInputChange('isPushNotification', e.target.checked)
                        }
                      />
                    }
                    label="Gửi Push Notification"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveNotification}
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
            Bạn có chắc chắn muốn xóa thông báo này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteNotification}
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

export default NotificationManage; 