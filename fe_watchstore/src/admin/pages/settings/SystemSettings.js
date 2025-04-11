import React, { useState, useEffect } from 'react';
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
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Cài đặt chung
    siteName: 'WatchStore',
    siteDescription: 'Cửa hàng đồng hồ trực tuyến',
    siteKeywords: 'đồng hồ, watch, đồng hồ nam, đồng hồ nữ',
    siteLogo: '',
    siteFavicon: '',
    maintenanceMode: false,
    maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau!',

    // Cài đặt email
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: '',
      fromName: '',
      testEmail: '',
    },

    // Cài đặt SEO
    seoSettings: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      robotsTxt: '',
      sitemapEnabled: true,
      sitemapFrequency: 'daily',
      sitemapPriority: 0.8,
    },

    // Cài đặt bảo mật
    securitySettings: {
      enableCaptcha: true,
      captchaType: 'recaptcha',
      recaptchaSiteKey: '',
      recaptchaSecretKey: '',
      maxLoginAttempts: 5,
      lockoutTime: 30, // phút
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumber: true,
      passwordRequireSpecialChar: true,
    },

    // Cài đặt hiệu suất
    performanceSettings: {
      enableCache: true,
      cacheLifetime: 3600, // giây
      enableCompression: true,
      enableMinify: true,
      enableLazyLoad: true,
      imageQuality: 80,
      maxUploadSize: 5, // MB
    },

    // Cài đặt thông báo
    notificationSettings: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSMSNotifications: false,
      notificationEmail: '',
      notificationPhone: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/system', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt hệ thống');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt hệ thống');
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
          <SettingsIcon color="primary" />
          Cài đặt hệ thống
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
              subheader="Các thiết lập cơ bản cho website"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên website"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mô tả website"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Từ khóa"
                    value={settings.siteKeywords}
                    onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Logo"
                    value={settings.siteLogo}
                    onChange={(e) => handleInputChange('siteLogo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Favicon"
                    value={settings.siteFavicon}
                    onChange={(e) => handleInputChange('siteFavicon', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      />
                    }
                    label="Chế độ bảo trì"
                  />
                </Grid>
                {settings.maintenanceMode && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Thông báo bảo trì"
                      multiline
                      rows={2}
                      value={settings.maintenanceMessage}
                      onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt email */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt email"
              subheader="Cấu hình hệ thống gửi email"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Host"
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) => handleInputChange('emailSettings.smtpHost', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Port"
                    type="number"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) => handleInputChange('emailSettings.smtpPort', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Username"
                    value={settings.emailSettings.smtpUsername}
                    onChange={(e) => handleInputChange('emailSettings.smtpUsername', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Password"
                    type="password"
                    value={settings.emailSettings.smtpPassword}
                    onChange={(e) => handleInputChange('emailSettings.smtpPassword', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Mã hóa SMTP</InputLabel>
                    <Select
                      value={settings.emailSettings.smtpEncryption}
                      label="Mã hóa SMTP"
                      onChange={(e) => handleInputChange('emailSettings.smtpEncryption', e.target.value)}
                    >
                      <MenuItem value="tls">TLS</MenuItem>
                      <MenuItem value="ssl">SSL</MenuItem>
                      <MenuItem value="none">Không mã hóa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email gửi đi"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => handleInputChange('emailSettings.fromEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên người gửi"
                    value={settings.emailSettings.fromName}
                    onChange={(e) => handleInputChange('emailSettings.fromName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email kiểm tra"
                    value={settings.emailSettings.testEmail}
                    onChange={(e) => handleInputChange('emailSettings.testEmail', e.target.value)}
                    helperText="Email để kiểm tra cài đặt"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt SEO */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt SEO"
              subheader="Tối ưu hóa công cụ tìm kiếm"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={settings.seoSettings.metaTitle}
                    onChange={(e) => handleInputChange('seoSettings.metaTitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Description"
                    multiline
                    rows={2}
                    value={settings.seoSettings.metaDescription}
                    onChange={(e) => handleInputChange('seoSettings.metaDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    value={settings.seoSettings.metaKeywords}
                    onChange={(e) => handleInputChange('seoSettings.metaKeywords', e.target.value)}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Robots.txt"
                    multiline
                    rows={4}
                    value={settings.seoSettings.robotsTxt}
                    onChange={(e) => handleInputChange('seoSettings.robotsTxt', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.seoSettings.sitemapEnabled}
                        onChange={(e) => handleInputChange('seoSettings.sitemapEnabled', e.target.checked)}
                      />
                    }
                    label="Bật sitemap"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tần suất cập nhật sitemap</InputLabel>
                    <Select
                      value={settings.seoSettings.sitemapFrequency}
                      label="Tần suất cập nhật sitemap"
                      onChange={(e) => handleInputChange('seoSettings.sitemapFrequency', e.target.value)}
                    >
                      <MenuItem value="always">Luôn luôn</MenuItem>
                      <MenuItem value="hourly">Hàng giờ</MenuItem>
                      <MenuItem value="daily">Hàng ngày</MenuItem>
                      <MenuItem value="weekly">Hàng tuần</MenuItem>
                      <MenuItem value="monthly">Hàng tháng</MenuItem>
                      <MenuItem value="yearly">Hàng năm</MenuItem>
                      <MenuItem value="never">Không bao giờ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Độ ưu tiên sitemap"
                    type="number"
                    value={settings.seoSettings.sitemapPriority}
                    onChange={(e) => handleInputChange('seoSettings.sitemapPriority', parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt bảo mật */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt bảo mật"
              subheader="Cấu hình bảo mật hệ thống"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.enableCaptcha}
                        onChange={(e) => handleInputChange('securitySettings.enableCaptcha', e.target.checked)}
                      />
                    }
                    label="Bật CAPTCHA"
                  />
                </Grid>
                {settings.securitySettings.enableCaptcha && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Loại CAPTCHA</InputLabel>
                        <Select
                          value={settings.securitySettings.captchaType}
                          label="Loại CAPTCHA"
                          onChange={(e) => handleInputChange('securitySettings.captchaType', e.target.value)}
                        >
                          <MenuItem value="recaptcha">reCAPTCHA</MenuItem>
                          <MenuItem value="hcaptcha">hCaptcha</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Site Key"
                        value={settings.securitySettings.recaptchaSiteKey}
                        onChange={(e) => handleInputChange('securitySettings.recaptchaSiteKey', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Secret Key"
                        type="password"
                        value={settings.securitySettings.recaptchaSecretKey}
                        onChange={(e) => handleInputChange('securitySettings.recaptchaSecretKey', e.target.value)}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số lần đăng nhập thất bại tối đa"
                    type="number"
                    value={settings.securitySettings.maxLoginAttempts}
                    onChange={(e) => handleInputChange('securitySettings.maxLoginAttempts', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian khóa tài khoản (phút)"
                    type="number"
                    value={settings.securitySettings.lockoutTime}
                    onChange={(e) => handleInputChange('securitySettings.lockoutTime', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Độ dài mật khẩu tối thiểu"
                    type="number"
                    value={settings.securitySettings.passwordMinLength}
                    onChange={(e) => handleInputChange('securitySettings.passwordMinLength', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.passwordRequireUppercase}
                        onChange={(e) => handleInputChange('securitySettings.passwordRequireUppercase', e.target.checked)}
                      />
                    }
                    label="Yêu cầu chữ hoa"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.passwordRequireLowercase}
                        onChange={(e) => handleInputChange('securitySettings.passwordRequireLowercase', e.target.checked)}
                      />
                    }
                    label="Yêu cầu chữ thường"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.passwordRequireNumber}
                        onChange={(e) => handleInputChange('securitySettings.passwordRequireNumber', e.target.checked)}
                      />
                    }
                    label="Yêu cầu số"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.passwordRequireSpecialChar}
                        onChange={(e) => handleInputChange('securitySettings.passwordRequireSpecialChar', e.target.checked)}
                      />
                    }
                    label="Yêu cầu ký tự đặc biệt"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt hiệu suất */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt hiệu suất"
              subheader="Tối ưu hóa hiệu suất hệ thống"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableCache}
                        onChange={(e) => handleInputChange('performanceSettings.enableCache', e.target.checked)}
                      />
                    }
                    label="Bật cache"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian cache (giây)"
                    type="number"
                    value={settings.performanceSettings.cacheLifetime}
                    onChange={(e) => handleInputChange('performanceSettings.cacheLifetime', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableCompression}
                        onChange={(e) => handleInputChange('performanceSettings.enableCompression', e.target.checked)}
                      />
                    }
                    label="Bật nén"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableMinify}
                        onChange={(e) => handleInputChange('performanceSettings.enableMinify', e.target.checked)}
                      />
                    }
                    label="Bật minify"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableLazyLoad}
                        onChange={(e) => handleInputChange('performanceSettings.enableLazyLoad', e.target.checked)}
                      />
                    }
                    label="Bật lazy load"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chất lượng ảnh (%)"
                    type="number"
                    value={settings.performanceSettings.imageQuality}
                    onChange={(e) => handleInputChange('performanceSettings.imageQuality', parseInt(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kích thước tải lên tối đa (MB)"
                    type="number"
                    value={settings.performanceSettings.maxUploadSize}
                    onChange={(e) => handleInputChange('performanceSettings.maxUploadSize', parseInt(e.target.value))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt thông báo */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt thông báo"
              subheader="Cấu hình hệ thống thông báo"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationSettings.enableEmailNotifications}
                        onChange={(e) => handleInputChange('notificationSettings.enableEmailNotifications', e.target.checked)}
                      />
                    }
                    label="Bật thông báo email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationSettings.enablePushNotifications}
                        onChange={(e) => handleInputChange('notificationSettings.enablePushNotifications', e.target.checked)}
                      />
                    }
                    label="Bật thông báo push"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationSettings.enableSMSNotifications}
                        onChange={(e) => handleInputChange('notificationSettings.enableSMSNotifications', e.target.checked)}
                      />
                    }
                    label="Bật thông báo SMS"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email nhận thông báo"
                    value={settings.notificationSettings.notificationEmail}
                    onChange={(e) => handleInputChange('notificationSettings.notificationEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại nhận thông báo"
                    value={settings.notificationSettings.notificationPhone}
                    onChange={(e) => handleInputChange('notificationSettings.notificationPhone', e.target.value)}
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

export default SystemSettings; 