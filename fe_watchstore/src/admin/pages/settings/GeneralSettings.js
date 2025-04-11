import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const GeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    siteInfo: {
      siteName: '',
      siteDescription: '',
      siteLogo: '',
      siteFavicon: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
    },
    localization: {
      defaultLanguage: 'vi',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'HH:mm',
      timezone: 'Asia/Ho_Chi_Minh',
      currency: 'VND',
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: '',
    },
    security: {
      enableCaptcha: true,
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '00:00',
      keepBackups: 7,
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
      const response = await fetch('http://localhost:8080/api/admin/settings/general', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt');
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

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [subsection]: {
          ...settings[section][subsection],
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/general', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt');
      }

      showSnackbar('Cài đặt đã được lưu thành công', 'success');
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cài đặt chung
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
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Site Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Thông tin website</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên website"
                    value={settings.siteInfo.siteName}
                    onChange={(e) => handleChange('siteInfo', 'siteName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email liên hệ"
                    value={settings.siteInfo.contactEmail}
                    onChange={(e) => handleChange('siteInfo', 'contactEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả website"
                    multiline
                    rows={2}
                    value={settings.siteInfo.siteDescription}
                    onChange={(e) => handleChange('siteInfo', 'siteDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={settings.siteInfo.contactPhone}
                    onChange={(e) => handleChange('siteInfo', 'contactPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={settings.siteInfo.address}
                    onChange={(e) => handleChange('siteInfo', 'address', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Localization */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LanguageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Ngôn ngữ và định dạng</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ngôn ngữ mặc định</InputLabel>
                    <Select
                      value={settings.localization.defaultLanguage}
                      label="Ngôn ngữ mặc định"
                      onChange={(e) => handleChange('localization', 'defaultLanguage', e.target.value)}
                    >
                      <MenuItem value="vi">Tiếng Việt</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Định dạng ngày</InputLabel>
                    <Select
                      value={settings.localization.dateFormat}
                      label="Định dạng ngày"
                      onChange={(e) => handleChange('localization', 'dateFormat', e.target.value)}
                    >
                      <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                      <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Múi giờ</InputLabel>
                    <Select
                      value={settings.localization.timezone}
                      label="Múi giờ"
                      onChange={(e) => handleChange('localization', 'timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</MenuItem>
                      <MenuItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</MenuItem>
                      <MenuItem value="Asia/Singapore">Asia/Singapore (GMT+8)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tiền tệ</InputLabel>
                    <Select
                      value={settings.localization.currency}
                      label="Tiền tệ"
                      onChange={(e) => handleChange('localization', 'currency', e.target.value)}
                    >
                      <MenuItem value="VND">VND (₫)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Bảo trì hệ thống</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenance.maintenanceMode}
                        onChange={(e) => handleChange('maintenance', 'maintenanceMode', e.target.checked)}
                      />
                    }
                    label="Chế độ bảo trì"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Thông báo bảo trì"
                    multiline
                    rows={2}
                    value={settings.maintenance.maintenanceMessage}
                    onChange={(e) => handleChange('maintenance', 'maintenanceMessage', e.target.value)}
                    disabled={!settings.maintenance.maintenanceMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Bảo mật</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.enableCaptcha}
                        onChange={(e) => handleChange('security', 'enableCaptcha', e.target.checked)}
                      />
                    }
                    label="Bật CAPTCHA"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) => handleChange('security', 'enableTwoFactor', e.target.checked)}
                      />
                    }
                    label="Xác thực hai yếu tố"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Thời gian phiên làm việc (phút)"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Số lần đăng nhập tối đa"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chính sách mật khẩu
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Độ dài tối thiểu"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.passwordPolicy.requireUppercase}
                            onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                          />
                        }
                        label="Yêu cầu chữ hoa"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.passwordPolicy.requireLowercase}
                            onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                          />
                        }
                        label="Yêu cầu chữ thường"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.passwordPolicy.requireNumbers}
                            onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                          />
                        }
                        label="Yêu cầu số"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.passwordPolicy.requireSpecialChars}
                            onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                          />
                        }
                        label="Yêu cầu ký tự đặc biệt"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Thông báo</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    }
                    label="Thông báo qua email"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                    }
                    label="Thông báo đẩy"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                    }
                    label="Thông báo SMS"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Backup */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Sao lưu dữ liệu</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.backup.autoBackup}
                        onChange={(e) => handleChange('backup', 'autoBackup', e.target.checked)}
                      />
                    }
                    label="Tự động sao lưu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tần suất sao lưu</InputLabel>
                    <Select
                      value={settings.backup.backupFrequency}
                      label="Tần suất sao lưu"
                      onChange={(e) => handleChange('backup', 'backupFrequency', e.target.value)}
                      disabled={!settings.backup.autoBackup}
                    >
                      <MenuItem value="hourly">Hàng giờ</MenuItem>
                      <MenuItem value="daily">Hàng ngày</MenuItem>
                      <MenuItem value="weekly">Hàng tuần</MenuItem>
                      <MenuItem value="monthly">Hàng tháng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Thời gian sao lưu"
                    value={settings.backup.backupTime}
                    onChange={(e) => handleChange('backup', 'backupTime', e.target.value)}
                    disabled={!settings.backup.autoBackup}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Số bản sao lưu giữ lại"
                    value={settings.backup.keepBackups}
                    onChange={(e) => handleChange('backup', 'keepBackups', parseInt(e.target.value))}
                    disabled={!settings.backup.autoBackup}
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

export default GeneralSettings; 