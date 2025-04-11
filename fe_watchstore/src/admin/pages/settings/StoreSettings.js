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
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Language as LanguageIcon,
  CurrencyExchange as CurrencyIcon,
} from '@mui/icons-material';

const StoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Thông tin cửa hàng
    storeInfo: {
      storeName: 'WatchStore',
      storeDescription: 'Cửa hàng đồng hồ chính hãng uy tín, giá tốt nhất thị trường',
      storeEmail: 'contact@watchstore.com',
      storePhone: '+84 123 456 789',
      storeAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
      storeLogo: 'https://watchstore.com/images/logo.png',
      storeFavicon: 'https://watchstore.com/images/favicon.ico',
    },

    // Giờ làm việc
    businessHours: {
      monday: { open: true, start: '08:00', end: '17:00' },
      tuesday: { open: true, start: '08:00', end: '17:00' },
      wednesday: { open: true, start: '08:00', end: '17:00' },
      thursday: { open: true, start: '08:00', end: '17:00' },
      friday: { open: true, start: '08:00', end: '17:00' },
      saturday: { open: true, start: '08:00', end: '12:00' },
      sunday: { open: false, start: '00:00', end: '00:00' },
    },

    // Cài đặt ngôn ngữ và tiền tệ
    localization: {
      defaultLanguage: 'vi',
      supportedLanguages: ['vi', 'en'],
      defaultCurrency: 'VND',
      supportedCurrencies: ['VND', 'USD', 'EUR'],
      currencyPosition: 'right',
      thousandSeparator: ',',
      decimalSeparator: '.',
      decimalPlaces: 0,
    },

    // Cài đặt hiển thị
    displaySettings: {
      productsPerPage: 12,
      enableReviews: true,
      enableRatings: true,
      enableWishlist: true,
      enableCompare: true,
      enableQuickView: true,
      enableStockStatus: true,
      showOutOfStock: true,
      showPrice: true,
      showTax: true,
      showDiscount: true,
    },

    // Cài đặt bảo mật
    securitySettings: {
      enableMaintenanceMode: false,
      maintenanceMessage: 'Website đang bảo trì. Vui lòng quay lại sau.',
      enableCaptcha: true,
      captchaType: 'reCAPTCHA',
      reCAPTCHASiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      reCAPTCHASecretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      enableTwoFactorAuth: false,
      sessionTimeout: 30, // phút
      maxLoginAttempts: 5,
      lockoutDuration: 15, // phút
    },

    // Cài đặt hiệu suất
    performanceSettings: {
      enableCache: true,
      cacheDuration: 3600, // giây
      enableCompression: true,
      enableMinification: true,
      enableLazyLoading: true,
      imageQuality: 80, // %
      maxImageWidth: 1200, // px
      maxImageHeight: 1200, // px
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/store', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt cửa hàng');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt cửa hàng');
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
          <StoreIcon color="primary" />
          Cài đặt cửa hàng
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
        {/* Thông tin cửa hàng */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Thông tin cửa hàng"
              subheader="Cấu hình thông tin cơ bản của cửa hàng"
              avatar={<StoreIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên cửa hàng"
                    value={settings.storeInfo.storeName}
                    onChange={(e) => handleInputChange('storeInfo.storeName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả cửa hàng"
                    multiline
                    rows={2}
                    value={settings.storeInfo.storeDescription}
                    onChange={(e) => handleInputChange('storeInfo.storeDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={settings.storeInfo.storeEmail}
                    onChange={(e) => handleInputChange('storeInfo.storeEmail', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={settings.storeInfo.storePhone}
                    onChange={(e) => handleInputChange('storeInfo.storePhone', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={settings.storeInfo.storeAddress}
                    onChange={(e) => handleInputChange('storeInfo.storeAddress', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Logo"
                    value={settings.storeInfo.storeLogo}
                    onChange={(e) => handleInputChange('storeInfo.storeLogo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Favicon"
                    value={settings.storeInfo.storeFavicon}
                    onChange={(e) => handleInputChange('storeInfo.storeFavicon', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Giờ làm việc */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Giờ làm việc"
              subheader="Cấu hình giờ làm việc của cửa hàng"
              avatar={<TimeIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(settings.businessHours).map(([day, hours]) => (
                  <Grid item xs={12} sm={6} key={day}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hours.open}
                            onChange={(e) =>
                              handleInputChange(`businessHours.${day}.open`, e.target.checked)
                            }
                          />
                        }
                        label={day.charAt(0).toUpperCase() + day.slice(1)}
                      />
                      {hours.open && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            type="time"
                            value={hours.start}
                            onChange={(e) =>
                              handleInputChange(`businessHours.${day}.start`, e.target.value)
                            }
                            size="small"
                          />
                          <TextField
                            type="time"
                            value={hours.end}
                            onChange={(e) =>
                              handleInputChange(`businessHours.${day}.end`, e.target.value)
                            }
                            size="small"
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt ngôn ngữ và tiền tệ */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Ngôn ngữ và tiền tệ"
              subheader="Cấu hình ngôn ngữ và tiền tệ mặc định"
              avatar={<LanguageIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ngôn ngữ mặc định</InputLabel>
                    <Select
                      value={settings.localization.defaultLanguage}
                      label="Ngôn ngữ mặc định"
                      onChange={(e) =>
                        handleInputChange('localization.defaultLanguage', e.target.value)
                      }
                    >
                      {settings.localization.supportedLanguages.map((lang) => (
                        <MenuItem key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tiền tệ mặc định</InputLabel>
                    <Select
                      value={settings.localization.defaultCurrency}
                      label="Tiền tệ mặc định"
                      onChange={(e) =>
                        handleInputChange('localization.defaultCurrency', e.target.value)
                      }
                    >
                      {settings.localization.supportedCurrencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vị trí ký hiệu tiền tệ</InputLabel>
                    <Select
                      value={settings.localization.currencyPosition}
                      label="Vị trí ký hiệu tiền tệ"
                      onChange={(e) =>
                        handleInputChange('localization.currencyPosition', e.target.value)
                      }
                    >
                      <MenuItem value="left">Bên trái</MenuItem>
                      <MenuItem value="right">Bên phải</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dấu phân cách hàng nghìn"
                    value={settings.localization.thousandSeparator}
                    onChange={(e) =>
                      handleInputChange('localization.thousandSeparator', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dấu phân cách thập phân"
                    value={settings.localization.decimalSeparator}
                    onChange={(e) =>
                      handleInputChange('localization.decimalSeparator', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số chữ số thập phân"
                    type="number"
                    value={settings.localization.decimalPlaces}
                    onChange={(e) =>
                      handleInputChange('localization.decimalPlaces', parseInt(e.target.value))
                    }
                    inputProps={{ min: 0, max: 4 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt hiển thị */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt hiển thị"
              subheader="Cấu hình cách hiển thị sản phẩm và thông tin"
              avatar={<StoreIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số sản phẩm mỗi trang"
                    type="number"
                    value={settings.displaySettings.productsPerPage}
                    onChange={(e) =>
                      handleInputChange('displaySettings.productsPerPage', parseInt(e.target.value))
                    }
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableReviews}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableReviews', e.target.checked)
                        }
                      />
                    }
                    label="Bật đánh giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableRatings}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableRatings', e.target.checked)
                        }
                      />
                    }
                    label="Bật xếp hạng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableWishlist}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableWishlist', e.target.checked)
                        }
                      />
                    }
                    label="Bật yêu thích"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableCompare}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableCompare', e.target.checked)
                        }
                      />
                    }
                    label="Bật so sánh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableQuickView}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableQuickView', e.target.checked)
                        }
                      />
                    }
                    label="Bật xem nhanh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.enableStockStatus}
                        onChange={(e) =>
                          handleInputChange('displaySettings.enableStockStatus', e.target.checked)
                        }
                      />
                    }
                    label="Hiển thị trạng thái tồn kho"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.showOutOfStock}
                        onChange={(e) =>
                          handleInputChange('displaySettings.showOutOfStock', e.target.checked)
                        }
                      />
                    }
                    label="Hiển thị sản phẩm hết hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.showPrice}
                        onChange={(e) =>
                          handleInputChange('displaySettings.showPrice', e.target.checked)
                        }
                      />
                    }
                    label="Hiển thị giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.showTax}
                        onChange={(e) =>
                          handleInputChange('displaySettings.showTax', e.target.checked)
                        }
                      />
                    }
                    label="Hiển thị thuế"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.displaySettings.showDiscount}
                        onChange={(e) =>
                          handleInputChange('displaySettings.showDiscount', e.target.checked)
                        }
                      />
                    }
                    label="Hiển thị giảm giá"
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
              subheader="Cấu hình các tùy chọn bảo mật"
              avatar={<StoreIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.enableMaintenanceMode}
                        onChange={(e) =>
                          handleInputChange('securitySettings.enableMaintenanceMode', e.target.checked)
                        }
                      />
                    }
                    label="Bật chế độ bảo trì"
                  />
                  {settings.securitySettings.enableMaintenanceMode && (
                    <TextField
                      fullWidth
                      label="Thông báo bảo trì"
                      multiline
                      rows={2}
                      value={settings.securitySettings.maintenanceMessage}
                      onChange={(e) =>
                        handleInputChange('securitySettings.maintenanceMessage', e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.enableCaptcha}
                        onChange={(e) =>
                          handleInputChange('securitySettings.enableCaptcha', e.target.checked)
                        }
                      />
                    }
                    label="Bật CAPTCHA"
                  />
                  {settings.securitySettings.enableCaptcha && (
                    <>
                      <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Loại CAPTCHA</InputLabel>
                        <Select
                          value={settings.securitySettings.captchaType}
                          label="Loại CAPTCHA"
                          onChange={(e) =>
                            handleInputChange('securitySettings.captchaType', e.target.value)
                          }
                        >
                          <MenuItem value="reCAPTCHA">reCAPTCHA</MenuItem>
                          <MenuItem value="hCaptcha">hCaptcha</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Site Key"
                        value={settings.securitySettings.reCAPTCHASiteKey}
                        onChange={(e) =>
                          handleInputChange('securitySettings.reCAPTCHASiteKey', e.target.value)
                        }
                        sx={{ mt: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Secret Key"
                        value={settings.securitySettings.reCAPTCHASecretKey}
                        onChange={(e) =>
                          handleInputChange('securitySettings.reCAPTCHASecretKey', e.target.value)
                        }
                        sx={{ mt: 1 }}
                      />
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.securitySettings.enableTwoFactorAuth}
                        onChange={(e) =>
                          handleInputChange('securitySettings.enableTwoFactorAuth', e.target.checked)
                        }
                      />
                    }
                    label="Bật xác thực hai yếu tố"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian hết phiên (phút)"
                    type="number"
                    value={settings.securitySettings.sessionTimeout}
                    onChange={(e) =>
                      handleInputChange('securitySettings.sessionTimeout', parseInt(e.target.value))
                    }
                    inputProps={{ min: 1, max: 1440 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số lần đăng nhập thất bại tối đa"
                    type="number"
                    value={settings.securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      handleInputChange('securitySettings.maxLoginAttempts', parseInt(e.target.value))
                    }
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian khóa tài khoản (phút)"
                    type="number"
                    value={settings.securitySettings.lockoutDuration}
                    onChange={(e) =>
                      handleInputChange('securitySettings.lockoutDuration', parseInt(e.target.value))
                    }
                    inputProps={{ min: 1, max: 1440 }}
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
              subheader="Cấu hình các tùy chọn tối ưu hiệu suất"
              avatar={<StoreIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableCache}
                        onChange={(e) =>
                          handleInputChange('performanceSettings.enableCache', e.target.checked)
                        }
                      />
                    }
                    label="Bật bộ nhớ đệm"
                  />
                  {settings.performanceSettings.enableCache && (
                    <TextField
                      fullWidth
                      label="Thời gian lưu cache (giây)"
                      type="number"
                      value={settings.performanceSettings.cacheDuration}
                      onChange={(e) =>
                        handleInputChange('performanceSettings.cacheDuration', parseInt(e.target.value))
                      }
                      inputProps={{ min: 60, max: 86400 }}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableCompression}
                        onChange={(e) =>
                          handleInputChange('performanceSettings.enableCompression', e.target.checked)
                        }
                      />
                    }
                    label="Bật nén"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableMinification}
                        onChange={(e) =>
                          handleInputChange('performanceSettings.enableMinification', e.target.checked)
                        }
                      />
                    }
                    label="Bật tối ưu mã"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceSettings.enableLazyLoading}
                        onChange={(e) =>
                          handleInputChange('performanceSettings.enableLazyLoading', e.target.checked)
                        }
                      />
                    }
                    label="Bật tải chậm hình ảnh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chất lượng hình ảnh (%)"
                    type="number"
                    value={settings.performanceSettings.imageQuality}
                    onChange={(e) =>
                      handleInputChange('performanceSettings.imageQuality', parseInt(e.target.value))
                    }
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chiều rộng hình ảnh tối đa (px)"
                    type="number"
                    value={settings.performanceSettings.maxImageWidth}
                    onChange={(e) =>
                      handleInputChange('performanceSettings.maxImageWidth', parseInt(e.target.value))
                    }
                    inputProps={{ min: 100, max: 3000 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chiều cao hình ảnh tối đa (px)"
                    type="number"
                    value={settings.performanceSettings.maxImageHeight}
                    onChange={(e) =>
                      handleInputChange('performanceSettings.maxImageHeight', parseInt(e.target.value))
                    }
                    inputProps={{ min: 100, max: 3000 }}
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

export default StoreSettings; 