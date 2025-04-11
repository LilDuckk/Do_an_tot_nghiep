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
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PushPin as PushPinIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Cài đặt chung
    generalSettings: {
      enableNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: true,
      enablePushNotifications: true,
      enableDesktopNotifications: true,
      enableSoundNotifications: true,
      enableBrowserNotifications: true,
      enableMobileNotifications: true,
    },

    // Cài đặt email
    emailSettings: {
      enabled: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'your-username',
      smtpPassword: 'your-password',
      smtpEncryption: 'tls',
      fromName: 'Watch Store',
      fromEmail: 'noreply@watchstore.com',
      replyTo: 'support@watchstore.com',
      enableTestMode: false,
      testEmail: '',
      enableEmailQueue: true,
      enableBounceHandling: true,
      enableUnsubscribe: true,
    },

    // Cài đặt SMS
    smsSettings: {
      enabled: true,
      provider: 'twilio',
      twilioAccountSid: 'your-account-sid',
      twilioAuthToken: 'your-auth-token',
      twilioPhoneNumber: '+1234567890',
      enableTestMode: false,
      testPhoneNumber: '',
      enableSMSQueue: true,
      enableDeliveryReports: true,
      enableOptOut: true,
    },

    // Cài đặt push notification
    pushSettings: {
      enabled: true,
      firebaseConfig: {
        apiKey: 'your-api-key',
        authDomain: 'your-auth-domain',
        projectId: 'your-project-id',
        storageBucket: 'your-storage-bucket',
        messagingSenderId: 'your-sender-id',
        appId: 'your-app-id',
        measurementId: 'your-measurement-id',
      },
      enableTestMode: false,
      testDeviceToken: '',
      enablePushQueue: true,
      enableDeliveryReports: true,
      enableOptOut: true,
    },

    // Cài đặt thông báo đơn hàng
    orderNotifications: {
      enableNewOrder: true,
      enableOrderStatusChange: true,
      enableOrderCancellation: true,
      enableOrderRefund: true,
      enableOrderShipped: true,
      enableOrderDelivered: true,
      enableOrderReview: true,
      enableOrderComment: true,
    },

    // Cài đặt thông báo sản phẩm
    productNotifications: {
      enableLowStock: true,
      enableOutOfStock: true,
      enablePriceChange: true,
      enableNewProduct: true,
      enableProductReview: true,
      enableProductComment: true,
      enableProductQuestion: true,
      enableProductAnswer: true,
    },

    // Cài đặt thông báo khách hàng
    customerNotifications: {
      enableNewCustomer: true,
      enableCustomerLogin: true,
      enableCustomerLogout: true,
      enableCustomerPasswordReset: true,
      enableCustomerProfileUpdate: true,
      enableCustomerAddressUpdate: true,
      enableCustomerWishlistUpdate: true,
      enableCustomerCartUpdate: true,
    },

    // Cài đặt thông báo khác
    otherNotifications: {
      enableSystemAlerts: true,
      enableSecurityAlerts: true,
      enableMaintenanceAlerts: true,
      enableBackupAlerts: true,
      enableErrorAlerts: true,
      enablePerformanceAlerts: true,
      enableApiAlerts: true,
      enableCustomAlerts: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt thông báo');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (path, value) => {
    const pathArray = path.split('.');
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings };
      let current = newSettings;
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt thông báo');
      }

      showSnackbar('Lưu cài đặt thành công', 'success');
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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          Cài đặt thông báo
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 1 }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Lưu cài đặt
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cài đặt chung */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt chung"
              subheader="Cấu hình các tùy chọn chung"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableEmailNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableEmailNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableSMSNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSMSNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo SMS"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enablePushNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enablePushNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo push"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableDesktopNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableDesktopNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo desktop"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableSoundNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSoundNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật âm thanh thông báo"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableBrowserNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableBrowserNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo trình duyệt"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableMobileNotifications}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableMobileNotifications', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo di động"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt email */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt email"
              subheader="Cấu hình thông báo email"
              avatar={<EmailIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('emailSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo email"
                  />
                </Grid>
                {settings.emailSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        value={settings.emailSettings.smtpHost}
                        onChange={(e) =>
                          handleInputChange('emailSettings.smtpHost', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        type="number"
                        value={settings.emailSettings.smtpPort}
                        onChange={(e) =>
                          handleInputChange('emailSettings.smtpPort', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Username"
                        value={settings.emailSettings.smtpUsername}
                        onChange={(e) =>
                          handleInputChange('emailSettings.smtpUsername', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Password"
                        type="password"
                        value={settings.emailSettings.smtpPassword}
                        onChange={(e) =>
                          handleInputChange('emailSettings.smtpPassword', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>SMTP Encryption</InputLabel>
                        <Select
                          value={settings.emailSettings.smtpEncryption}
                          onChange={(e) =>
                            handleInputChange('emailSettings.smtpEncryption', e.target.value)
                          }
                          label="SMTP Encryption"
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="tls">TLS</MenuItem>
                          <MenuItem value="ssl">SSL</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="From Name"
                        value={settings.emailSettings.fromName}
                        onChange={(e) =>
                          handleInputChange('emailSettings.fromName', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="From Email"
                        type="email"
                        value={settings.emailSettings.fromEmail}
                        onChange={(e) =>
                          handleInputChange('emailSettings.fromEmail', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Reply To"
                        type="email"
                        value={settings.emailSettings.replyTo}
                        onChange={(e) =>
                          handleInputChange('emailSettings.replyTo', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailSettings.enableTestMode}
                            onChange={(e) =>
                              handleInputChange('emailSettings.enableTestMode', e.target.checked)
                            }
                          />
                        }
                        label="Bật chế độ test"
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Test Email"
                        type="email"
                        value={settings.emailSettings.testEmail}
                        onChange={(e) =>
                          handleInputChange('emailSettings.testEmail', e.target.value)
                        }
                        disabled={!settings.emailSettings.enableTestMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailSettings.enableEmailQueue}
                            onChange={(e) =>
                              handleInputChange('emailSettings.enableEmailQueue', e.target.checked)
                            }
                          />
                        }
                        label="Bật hàng đợi email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailSettings.enableBounceHandling}
                            onChange={(e) =>
                              handleInputChange('emailSettings.enableBounceHandling', e.target.checked)
                            }
                          />
                        }
                        label="Bật xử lý bounce"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailSettings.enableUnsubscribe}
                            onChange={(e) =>
                              handleInputChange('emailSettings.enableUnsubscribe', e.target.checked)
                            }
                          />
                        }
                        label="Bật hủy đăng ký"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt SMS */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt SMS"
              subheader="Cấu hình thông báo SMS"
              avatar={<SmsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('smsSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo SMS"
                  />
                </Grid>
                {settings.smsSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Provider</InputLabel>
                        <Select
                          value={settings.smsSettings.provider}
                          onChange={(e) =>
                            handleInputChange('smsSettings.provider', e.target.value)
                          }
                          label="Provider"
                        >
                          <MenuItem value="twilio">Twilio</MenuItem>
                          <MenuItem value="nexmo">Nexmo</MenuItem>
                          <MenuItem value="plivo">Plivo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Twilio Account SID"
                        value={settings.smsSettings.twilioAccountSid}
                        onChange={(e) =>
                          handleInputChange('smsSettings.twilioAccountSid', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Twilio Auth Token"
                        type="password"
                        value={settings.smsSettings.twilioAuthToken}
                        onChange={(e) =>
                          handleInputChange('smsSettings.twilioAuthToken', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Twilio Phone Number"
                        value={settings.smsSettings.twilioPhoneNumber}
                        onChange={(e) =>
                          handleInputChange('smsSettings.twilioPhoneNumber', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.smsSettings.enableTestMode}
                            onChange={(e) =>
                              handleInputChange('smsSettings.enableTestMode', e.target.checked)
                            }
                          />
                        }
                        label="Bật chế độ test"
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Test Phone Number"
                        value={settings.smsSettings.testPhoneNumber}
                        onChange={(e) =>
                          handleInputChange('smsSettings.testPhoneNumber', e.target.value)
                        }
                        disabled={!settings.smsSettings.enableTestMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.smsSettings.enableSMSQueue}
                            onChange={(e) =>
                              handleInputChange('smsSettings.enableSMSQueue', e.target.checked)
                            }
                          />
                        }
                        label="Bật hàng đợi SMS"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.smsSettings.enableDeliveryReports}
                            onChange={(e) =>
                              handleInputChange('smsSettings.enableDeliveryReports', e.target.checked)
                            }
                          />
                        }
                        label="Bật báo cáo giao hàng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.smsSettings.enableOptOut}
                            onChange={(e) =>
                              handleInputChange('smsSettings.enableOptOut', e.target.checked)
                            }
                          />
                        }
                        label="Bật hủy đăng ký"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt push notification */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt push notification"
              subheader="Cấu hình thông báo push"
              avatar={<PushPinIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('pushSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo push"
                  />
                </Grid>
                {settings.pushSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase API Key"
                        value={settings.pushSettings.firebaseConfig.apiKey}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.apiKey', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase Auth Domain"
                        value={settings.pushSettings.firebaseConfig.authDomain}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.authDomain', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase Project ID"
                        value={settings.pushSettings.firebaseConfig.projectId}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.projectId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase Storage Bucket"
                        value={settings.pushSettings.firebaseConfig.storageBucket}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.storageBucket', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase Messaging Sender ID"
                        value={settings.pushSettings.firebaseConfig.messagingSenderId}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.messagingSenderId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase App ID"
                        value={settings.pushSettings.firebaseConfig.appId}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.appId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Firebase Measurement ID"
                        value={settings.pushSettings.firebaseConfig.measurementId}
                        onChange={(e) =>
                          handleInputChange('pushSettings.firebaseConfig.measurementId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushSettings.enableTestMode}
                            onChange={(e) =>
                              handleInputChange('pushSettings.enableTestMode', e.target.checked)
                            }
                          />
                        }
                        label="Bật chế độ test"
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Test Device Token"
                        value={settings.pushSettings.testDeviceToken}
                        onChange={(e) =>
                          handleInputChange('pushSettings.testDeviceToken', e.target.value)
                        }
                        disabled={!settings.pushSettings.enableTestMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushSettings.enablePushQueue}
                            onChange={(e) =>
                              handleInputChange('pushSettings.enablePushQueue', e.target.checked)
                            }
                          />
                        }
                        label="Bật hàng đợi push"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushSettings.enableDeliveryReports}
                            onChange={(e) =>
                              handleInputChange('pushSettings.enableDeliveryReports', e.target.checked)
                            }
                          />
                        }
                        label="Bật báo cáo giao hàng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushSettings.enableOptOut}
                            onChange={(e) =>
                              handleInputChange('pushSettings.enableOptOut', e.target.checked)
                            }
                          />
                        }
                        label="Bật hủy đăng ký"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt thông báo đơn hàng */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt thông báo đơn hàng"
              subheader="Cấu hình thông báo liên quan đến đơn hàng"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableNewOrder}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableNewOrder', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đơn hàng mới"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderStatusChange}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderStatusChange', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo thay đổi trạng thái"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderCancellation}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderCancellation', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hủy đơn hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderRefund}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderRefund', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hoàn tiền"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderShipped}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderShipped', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo giao hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderDelivered}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderDelivered', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đã giao"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderReview}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderReview', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đánh giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications.enableOrderComment}
                        onChange={(e) =>
                          handleInputChange('orderNotifications.enableOrderComment', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo bình luận"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt thông báo sản phẩm */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt thông báo sản phẩm"
              subheader="Cấu hình thông báo liên quan đến sản phẩm"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableLowStock}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableLowStock', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hàng sắp hết"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableOutOfStock}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableOutOfStock', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hết hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enablePriceChange}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enablePriceChange', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo thay đổi giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableNewProduct}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableNewProduct', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo sản phẩm mới"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableProductReview}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableProductReview', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đánh giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableProductComment}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableProductComment', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo bình luận"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableProductQuestion}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableProductQuestion', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo câu hỏi"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.productNotifications.enableProductAnswer}
                        onChange={(e) =>
                          handleInputChange('productNotifications.enableProductAnswer', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo trả lời"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt thông báo khách hàng */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt thông báo khách hàng"
              subheader="Cấu hình thông báo liên quan đến khách hàng"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableNewCustomer}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableNewCustomer', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo khách hàng mới"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerLogin}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerLogin', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đăng nhập"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerLogout}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerLogout', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đăng xuất"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerPasswordReset}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerPasswordReset', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo đặt lại mật khẩu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerProfileUpdate}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerProfileUpdate', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo cập nhật hồ sơ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerAddressUpdate}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerAddressUpdate', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo cập nhật địa chỉ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerWishlistUpdate}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerWishlistUpdate', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo cập nhật yêu thích"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.customerNotifications.enableCustomerCartUpdate}
                        onChange={(e) =>
                          handleInputChange('customerNotifications.enableCustomerCartUpdate', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo cập nhật giỏ hàng"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt thông báo khác */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt thông báo khác"
              subheader="Cấu hình các thông báo khác"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableSystemAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableSystemAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hệ thống"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableSecurityAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableSecurityAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo bảo mật"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableMaintenanceAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableMaintenanceAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo bảo trì"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableBackupAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableBackupAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo sao lưu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableErrorAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableErrorAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo lỗi"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enablePerformanceAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enablePerformanceAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo hiệu suất"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableApiAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableApiAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo API"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherNotifications.enableCustomAlerts}
                        onChange={(e) =>
                          handleInputChange('otherNotifications.enableCustomAlerts', e.target.checked)
                        }
                      />
                    }
                    label="Bật thông báo tùy chỉnh"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default NotificationSettings; 