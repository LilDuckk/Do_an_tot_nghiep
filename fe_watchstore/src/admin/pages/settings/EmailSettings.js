import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testingSMTP, setTestingSMTP] = useState(false);

  const [settings, setSettings] = useState({
    smtp: {
      server: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'TLS',
      fromEmail: '',
      fromName: '',
      enabled: true,
    },
    templates: {
      orderConfirmation: {
        subject: '',
        body: '',
        enabled: true,
      },
      passwordReset: {
        subject: '',
        body: '',
        enabled: true,
      },
      welcome: {
        subject: '',
        body: '',
        enabled: true,
      },
      shipping: {
        subject: '',
        body: '',
        enabled: true,
      },
      promotion: {
        subject: '',
        body: '',
        enabled: true,
      },
    },
    notifications: {
      newOrder: true,
      lowStock: true,
      newCustomer: true,
      productReview: true,
    },
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/email', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt email');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeSmtp = (field, value) => {
    setSettings({
      ...settings,
      smtp: {
        ...settings.smtp,
        [field]: value,
      },
    });
  };

  const handleChangeTemplate = (template, field, value) => {
    setSettings({
      ...settings,
      templates: {
        ...settings.templates,
        [template]: {
          ...settings.templates[template],
          [field]: value,
        },
      },
    });
  };

  const handleChangeNotification = (field, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt email');
      }

      showSnackbar('Cài đặt email đã được lưu thành công', 'success');
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingSMTP(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          smtpSettings: settings.smtp,
          testEmail: testEmailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Test email không thành công');
      }

      showSnackbar('Email thử nghiệm đã được gửi thành công', 'success');
      setTestEmailDialog(false);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setTestingSMTP(false);
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleOpenTestDialog = () => {
    setTestEmailDialog(true);
  };

  const handleCloseTestDialog = () => {
    setTestEmailDialog(false);
  };

  if (loading && !settings.smtp.server) {
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
          Cài đặt Email
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={handleOpenTestDialog}
          >
            Gửi email thử nghiệm
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="email settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="Cài đặt SMTP"
            />
            <Tab
              icon={<DescriptionIcon />}
              iconPosition="start"
              label="Mẫu email"
            />
            <Tab
              icon={<EmailIcon />}
              iconPosition="start"
              label="Thông báo email"
            />
          </Tabs>
        </Box>

        {/* SMTP Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smtp.enabled}
                    onChange={(e) => handleChangeSmtp('enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="Kích hoạt gửi email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máy chủ SMTP"
                variant="outlined"
                value={settings.smtp.server}
                onChange={(e) => handleChangeSmtp('server', e.target.value)}
                disabled={!settings.smtp.enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cổng SMTP"
                variant="outlined"
                type="number"
                value={settings.smtp.port}
                onChange={(e) => handleChangeSmtp('port', e.target.value)}
                disabled={!settings.smtp.enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên đăng nhập SMTP"
                variant="outlined"
                value={settings.smtp.username}
                onChange={(e) => handleChangeSmtp('username', e.target.value)}
                disabled={!settings.smtp.enabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth disabled={!settings.smtp.enabled}>
                <InputLabel htmlFor="smtp-password">Mật khẩu SMTP</InputLabel>
                <OutlinedInput
                  id="smtp-password"
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtp.password}
                  onChange={(e) => handleChangeSmtp('password', e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Mật khẩu SMTP"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!settings.smtp.enabled}>
                <InputLabel>Mã hóa</InputLabel>
                <Select
                  value={settings.smtp.encryption}
                  label="Mã hóa"
                  onChange={(e) => handleChangeSmtp('encryption', e.target.value)}
                >
                  <MenuItem value="SSL">SSL</MenuItem>
                  <MenuItem value="TLS">TLS</MenuItem>
                  <MenuItem value="NONE">Không mã hóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email gửi đi"
                variant="outlined"
                value={settings.smtp.fromEmail}
                onChange={(e) => handleChangeSmtp('fromEmail', e.target.value)}
                disabled={!settings.smtp.enabled}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tên hiển thị"
                variant="outlined"
                value={settings.smtp.fromName}
                onChange={(e) => handleChangeSmtp('fromName', e.target.value)}
                disabled={!settings.smtp.enabled}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Email Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Tabs
            value={Object.keys(settings.templates).findIndex((template) => 
              document.activeElement && document.activeElement.id?.includes(template)
            ) !== -1 ? 
              Object.keys(settings.templates).findIndex((template) => 
                document.activeElement && document.activeElement.id?.includes(template)
              ) : 0
            }
            onChange={(e, val) => {}}
            aria-label="email templates tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Xác nhận đơn hàng" />
            <Tab label="Đặt lại mật khẩu" />
            <Tab label="Chào mừng" />
            <Tab label="Thông báo vận chuyển" />
            <Tab label="Khuyến mãi" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {/* Order Confirmation Template */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Mẫu xác nhận đơn hàng</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.templates.orderConfirmation.enabled}
                          onChange={(e) => handleChangeTemplate('orderConfirmation', 'enabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Kích hoạt"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="orderConfirmation-subject"
                    fullWidth
                    label="Tiêu đề"
                    variant="outlined"
                    value={settings.templates.orderConfirmation.subject}
                    onChange={(e) => handleChangeTemplate('orderConfirmation', 'subject', e.target.value)}
                    disabled={!settings.templates.orderConfirmation.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="orderConfirmation-body"
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={settings.templates.orderConfirmation.body}
                    onChange={(e) => handleChangeTemplate('orderConfirmation', 'body', e.target.value)}
                    disabled={!settings.templates.orderConfirmation.enabled}
                    helperText="Sử dụng {order_id}, {customer_name}, {order_total}, {order_date}, {order_items} để chèn dữ liệu động"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Password Reset Template */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Mẫu đặt lại mật khẩu</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.templates.passwordReset.enabled}
                          onChange={(e) => handleChangeTemplate('passwordReset', 'enabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Kích hoạt"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="passwordReset-subject"
                    fullWidth
                    label="Tiêu đề"
                    variant="outlined"
                    value={settings.templates.passwordReset.subject}
                    onChange={(e) => handleChangeTemplate('passwordReset', 'subject', e.target.value)}
                    disabled={!settings.templates.passwordReset.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="passwordReset-body"
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={settings.templates.passwordReset.body}
                    onChange={(e) => handleChangeTemplate('passwordReset', 'body', e.target.value)}
                    disabled={!settings.templates.passwordReset.enabled}
                    helperText="Sử dụng {reset_link}, {customer_name}, {expiry_time} để chèn dữ liệu động"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Welcome Template */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Mẫu email chào mừng</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.templates.welcome.enabled}
                          onChange={(e) => handleChangeTemplate('welcome', 'enabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Kích hoạt"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="welcome-subject"
                    fullWidth
                    label="Tiêu đề"
                    variant="outlined"
                    value={settings.templates.welcome.subject}
                    onChange={(e) => handleChangeTemplate('welcome', 'subject', e.target.value)}
                    disabled={!settings.templates.welcome.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="welcome-body"
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={settings.templates.welcome.body}
                    onChange={(e) => handleChangeTemplate('welcome', 'body', e.target.value)}
                    disabled={!settings.templates.welcome.enabled}
                    helperText="Sử dụng {customer_name}, {login_link} để chèn dữ liệu động"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Shipping Notification Template */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Mẫu thông báo vận chuyển</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.templates.shipping.enabled}
                          onChange={(e) => handleChangeTemplate('shipping', 'enabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Kích hoạt"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="shipping-subject"
                    fullWidth
                    label="Tiêu đề"
                    variant="outlined"
                    value={settings.templates.shipping.subject}
                    onChange={(e) => handleChangeTemplate('shipping', 'subject', e.target.value)}
                    disabled={!settings.templates.shipping.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="shipping-body"
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={settings.templates.shipping.body}
                    onChange={(e) => handleChangeTemplate('shipping', 'body', e.target.value)}
                    disabled={!settings.templates.shipping.enabled}
                    helperText="Sử dụng {order_id}, {customer_name}, {tracking_number}, {shipping_company}, {estimated_delivery} để chèn dữ liệu động"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Promotion Template */}
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Mẫu email khuyến mãi</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.templates.promotion.enabled}
                          onChange={(e) => handleChangeTemplate('promotion', 'enabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Kích hoạt"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="promotion-subject"
                    fullWidth
                    label="Tiêu đề"
                    variant="outlined"
                    value={settings.templates.promotion.subject}
                    onChange={(e) => handleChangeTemplate('promotion', 'subject', e.target.value)}
                    disabled={!settings.templates.promotion.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="promotion-body"
                    fullWidth
                    label="Nội dung"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={settings.templates.promotion.body}
                    onChange={(e) => handleChangeTemplate('promotion', 'body', e.target.value)}
                    disabled={!settings.templates.promotion.enabled}
                    helperText="Sử dụng {customer_name}, {promo_code}, {discount_value}, {expiry_date} để chèn dữ liệu động"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        {/* Email Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kích hoạt thông báo qua email
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.newOrder}
                            onChange={(e) => handleChangeNotification('newOrder', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Đơn hàng mới"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.lowStock}
                            onChange={(e) => handleChangeNotification('lowStock', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Cảnh báo hàng tồn kho thấp"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.newCustomer}
                            onChange={(e) => handleChangeNotification('newCustomer', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Khách hàng mới đăng ký"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.productReview}
                            onChange={(e) => handleChangeNotification('productReview', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Đánh giá sản phẩm mới"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Test Email Dialog */}
      <Dialog
        open={testEmailDialog}
        onClose={handleCloseTestDialog}
        aria-labelledby="test-email-dialog-title"
      >
        <DialogTitle id="test-email-dialog-title">Gửi email thử nghiệm</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nhập địa chỉ email để gửi thử nghiệm. Email này sẽ được sử dụng để kiểm tra cấu hình SMTP.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="test-email"
            label="Địa chỉ email"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleTestEmail}
            color="primary"
            disabled={testingSMTP || !testEmailAddress || !settings.smtp.server}
            variant="contained"
            startIcon={testingSMTP ? <CircularProgress size={24} /> : <SendIcon />}
          >
            {testingSMTP ? 'Đang gửi...' : 'Gửi thử nghiệm'}
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

export default EmailSettings; 