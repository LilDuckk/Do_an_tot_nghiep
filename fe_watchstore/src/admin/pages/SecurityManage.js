import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

const SecurityManage = () => {
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
    },
    loginPolicy: {
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      sessionTimeout: 60, // minutes
      requireTwoFactor: false,
    },
    ipWhitelist: [],
    ipBlacklist: [],
    securityLogs: [],
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: '',
    reason: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [showPassword, setShowPassword] = useState(false);

  const fetchSecuritySettings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/security/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setSecuritySettings(data);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      showSnackbar('Không thể tải cài đặt bảo mật', 'error');
    }
  }, []);

  useEffect(() => {
    fetchSecuritySettings();
  }, [fetchSecuritySettings]);

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    if (item) {
      setFormData({
        ipAddress: item.ipAddress || '',
        description: item.description || '',
        reason: item.reason || '',
      });
    } else {
      setFormData({
        ipAddress: '',
        description: '',
        reason: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setSelectedItem(null);
    setFormData({
      ipAddress: '',
      description: '',
      reason: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith('passwordPolicy.') || name.startsWith('loginPolicy.')) {
      const [section, field] = name.split('.');
      setSecuritySettings({
        ...securitySettings,
        [section]: {
          ...securitySettings[section],
          [field]: typeof checked === 'boolean' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogType === 'whitelist' || dialogType === 'blacklist') {
        const url = selectedItem
          ? `http://localhost:8080/api/admin/security/${dialogType}/${selectedItem.id}`
          : `http://localhost:8080/api/admin/security/${dialogType}`;
        const method = selectedItem ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          fetchSecuritySettings();
          handleCloseDialog();
          showSnackbar(
            `IP ${selectedItem ? 'đã được cập nhật' : 'đã được thêm vào'} ${dialogType === 'whitelist' ? 'danh sách trắng' : 'danh sách đen'}`,
            'success'
          );
        } else {
          showSnackbar('Có lỗi xảy ra', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/security/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(securitySettings),
      });

      if (response.ok) {
        showSnackbar('Cài đặt bảo mật đã được cập nhật', 'success');
      } else {
        showSnackbar('Có lỗi xảy ra khi cập nhật cài đặt', 'error');
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      showSnackbar('Có lỗi xảy ra khi cập nhật cài đặt', 'error');
    }
  };

  const handleDeleteIp = async (type, id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa IP này?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/security/${type}/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (response.ok) {
          fetchSecuritySettings();
          showSnackbar('IP đã được xóa', 'success');
        } else {
          showSnackbar('Có lỗi xảy ra khi xóa IP', 'error');
        }
      } catch (error) {
        console.error('Error deleting IP:', error);
        showSnackbar('Có lỗi xảy ra khi xóa IP', 'error');
      }
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

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSecurityLevelText = (level) => {
    switch (level) {
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return level;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý bảo mật hệ thống
      </Typography>

      <Grid container spacing={3}>
        {/* Chính sách mật khẩu */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Chính sách mật khẩu"
              avatar={<LockIcon />}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSettings}
                >
                  Lưu thay đổi
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Độ dài tối thiểu"
                    name="passwordPolicy.minLength"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 6 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordPolicy.requireUppercase}
                        onChange={handleChange}
                        name="passwordPolicy.requireUppercase"
                      />
                    }
                    label="Yêu cầu chữ hoa"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordPolicy.requireLowercase}
                        onChange={handleChange}
                        name="passwordPolicy.requireLowercase"
                      />
                    }
                    label="Yêu cầu chữ thường"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordPolicy.requireNumbers}
                        onChange={handleChange}
                        name="passwordPolicy.requireNumbers"
                      />
                    }
                    label="Yêu cầu số"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.passwordPolicy.requireSpecialChars}
                        onChange={handleChange}
                        name="passwordPolicy.requireSpecialChars"
                      />
                    }
                    label="Yêu cầu ký tự đặc biệt"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Số ngày hết hạn mật khẩu"
                    name="passwordPolicy.passwordExpiryDays"
                    value={securitySettings.passwordPolicy.passwordExpiryDays}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Chính sách đăng nhập */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Chính sách đăng nhập"
              avatar={<VpnKeyIcon />}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSettings}
                >
                  Lưu thay đổi
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Số lần đăng nhập tối đa"
                    name="loginPolicy.maxLoginAttempts"
                    value={securitySettings.loginPolicy.maxLoginAttempts}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Thời gian khóa (phút)"
                    name="loginPolicy.lockoutDuration"
                    value={securitySettings.loginPolicy.lockoutDuration}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Thời gian phiên làm việc (phút)"
                    name="loginPolicy.sessionTimeout"
                    value={securitySettings.loginPolicy.sessionTimeout}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.loginPolicy.requireTwoFactor}
                        onChange={handleChange}
                        name="loginPolicy.requireTwoFactor"
                      />
                    }
                    label="Yêu cầu xác thực hai yếu tố"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách IP trắng */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Danh sách IP trắng"
              avatar={<CheckCircleIcon color="success" />}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('whitelist')}
                >
                  Thêm IP
                </Button>
              }
            />
            <CardContent>
              <List>
                {securitySettings.ipWhitelist.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.ipAddress}
                      secondary={item.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog('whitelist', item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteIp('whitelist', item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {securitySettings.ipWhitelist.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Không có IP nào trong danh sách trắng" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách IP đen */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Danh sách IP đen"
              avatar={<BlockIcon color="error" />}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('blacklist')}
                >
                  Thêm IP
                </Button>
              }
            />
            <CardContent>
              <List>
                {securitySettings.ipBlacklist.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <BlockIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.ipAddress}
                      secondary={
                        <>
                          {item.description}
                          <br />
                          <Typography variant="caption" color="error">
                            Lý do: {item.reason}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog('blacklist', item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteIp('blacklist', item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {securitySettings.ipBlacklist.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Không có IP nào trong danh sách đen" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Nhật ký bảo mật */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Nhật ký bảo mật"
              avatar={<HistoryIcon />}
              action={
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchSecuritySettings}
                >
                  Làm mới
                </Button>
              }
            />
            <CardContent>
              <List>
                {securitySettings.securityLogs.map((log, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {log.type === 'LOGIN_SUCCESS' && <CheckCircleIcon color="success" />}
                      {log.type === 'LOGIN_FAILURE' && <ErrorIcon color="error" />}
                      {log.type === 'PASSWORD_CHANGE' && <LockIcon color="primary" />}
                      {log.type === 'SECURITY_SETTING_CHANGE' && <SecurityIcon color="info" />}
                      {log.type === 'IP_BLOCKED' && <BlockIcon color="error" />}
                      {log.type === 'SYSTEM_ALERT' && <WarningIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {log.description}
                          </Typography>
                          <Chip
                            label={getSecurityLevelText(log.securityLevel)}
                            color={getSecurityLevelColor(log.securityLevel)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            IP: {log.ipAddress} | Người dùng: {log.username || 'Không xác định'}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(log.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {securitySettings.securityLogs.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Không có nhật ký bảo mật nào" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog thêm/sửa IP */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedItem
            ? `Sửa IP ${dialogType === 'whitelist' ? 'danh sách trắng' : 'danh sách đen'}`
            : `Thêm IP vào ${dialogType === 'whitelist' ? 'danh sách trắng' : 'danh sách đen'}`}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ IP"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: 192.168.1.1"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              {dialogType === 'blacklist' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Lý do chặn"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
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

export default SecurityManage; 