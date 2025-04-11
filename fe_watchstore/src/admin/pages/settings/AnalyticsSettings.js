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
  Analytics as AnalyticsIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const AnalyticsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    generalSettings: {
      enableAnalytics: true,
      enableRealTimeAnalytics: true,
      enableUserTracking: true,
      enableEventTracking: true,
      enableEcommerceTracking: true,
      enableCustomDimensions: true,
      enableCustomMetrics: true,
      enableEnhancedEcommerce: true
    },

    googleAnalyticsSettings: {
      enabled: true,
      trackingId: 'UA-XXXXXXXXX-X',
      viewId: 'XXXXXXXX',
      propertyId: 'XXXXXXXX',
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      enableEnhancedMeasurement: true,
      enableUserTiming: true,
      enableExceptionTracking: true,
      enableLinkTracking: true,
      enableFormTracking: true,
      enableVideoTracking: true,
      enableScrollTracking: true,
      enableFileDownloadTracking: true,
      enableOutboundLinkTracking: true,
      enableSiteSearchTracking: true,
      enableSocialTracking: true,
      enableCustomEvents: true
    },

    googleTagManagerSettings: {
      enabled: true,
      containerId: 'GTM-XXXXXX',
      enablePreviewMode: true,
      enableDebugMode: true,
      enableDataLayer: true,
      enableCustomEvents: true,
      enableUserVariables: true,
      enableEcommerceVariables: true
    },

    facebookPixelSettings: {
      enabled: true,
      pixelId: 'XXXXXXXXXXXXXXX',
      enableAdvancedMatching: true,
      enableAutomaticConfig: true,
      enableCustomEvents: true,
      enableViewContent: true,
      enableAddToCart: true,
      enableInitiateCheckout: true,
      enablePurchase: true,
      enableLead: true,
      enableCompleteRegistration: true
    },

    twitterPixelSettings: {
      enabled: true,
      pixelId: 'XXXXXXXXXXXXXXX',
      enableCustomEvents: true,
      enablePageView: true,
      enableViewContent: true,
      enableAddToCart: true,
      enablePurchase: true,
      enableSignUp: true
    },

    instagramPixelSettings: {
      enabled: true,
      pixelId: 'XXXXXXXXXXXXXXX',
      enableCustomEvents: true,
      enableViewContent: true,
      enableAddToCart: true,
      enablePurchase: true,
      enableLead: true
    },

    youtubeAnalyticsSettings: {
      enabled: true,
      channelId: 'UCXXXXXXXXXXXXXXX',
      enableVideoTracking: true,
      enablePlaybackTracking: true,
      enableEngagementTracking: true,
      enableDemographicsTracking: true
    },

    linkedinInsightTagSettings: {
      enabled: true,
      partnerId: 'XXXXXXXX',
      enableCustomEvents: true,
      enablePageView: true,
      enableLead: true,
      enableSignUp: true,
      enablePurchase: true
    },

    pinterestTagSettings: {
      enabled: true,
      tagId: 'XXXXXXXXXXXXXXX',
      enableCustomEvents: true,
      enablePageVisit: true,
      enableViewCategory: true,
      enableAddToCart: true,
      enableCheckout: true,
      enablePurchase: true
    },

    otherSettings: {
      enableHeatmaps: true,
      enableSessionRecording: true,
      enableABTesting: true,
      enableConversionFunnels: true,
      enableGoalTracking: true,
      enableCustomReports: true,
      enableDataExport: true,
      enableAPI: true
    }
  });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/analytics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt phân tích');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = useCallback((path, value) => {
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
  }, []);

  const handleSaveSettings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/analytics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt phân tích');
      }

      showSnackbar('Lưu cài đặt thành công', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  }, [settings, showSnackbar]);

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
          <AnalyticsIcon color="primary" />
          Cài đặt phân tích
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
                        checked={settings.generalSettings.enableAnalytics}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableAnalytics', e.target.checked)
                        }
                      />
                    }
                    label="Bật phân tích"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableRealTimeAnalytics}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableRealTimeAnalytics', e.target.checked)
                        }
                      />
                    }
                    label="Bật phân tích thời gian thực"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableUserTracking}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableUserTracking', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi người dùng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableEventTracking}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableEventTracking', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi sự kiện"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableEcommerceTracking}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableEcommerceTracking', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi thương mại điện tử"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableCustomDimensions}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableCustomDimensions', e.target.checked)
                        }
                      />
                    }
                    label="Bật thứ nguyên tùy chỉnh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableCustomMetrics}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableCustomMetrics', e.target.checked)
                        }
                      />
                    }
                    label="Bật số liệu tùy chỉnh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableEnhancedEcommerce}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableEnhancedEcommerce', e.target.checked)
                        }
                      />
                    }
                    label="Bật thương mại điện tử nâng cao"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Google Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Google Analytics"
              subheader="Cấu hình tích hợp Google Analytics"
              avatar={<GoogleIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.googleAnalyticsSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật Google Analytics"
                  />
                </Grid>
                {settings.googleAnalyticsSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tracking ID"
                        value={settings.googleAnalyticsSettings.trackingId}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.trackingId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="View ID"
                        value={settings.googleAnalyticsSettings.viewId}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.viewId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Property ID"
                        value={settings.googleAnalyticsSettings.propertyId}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.propertyId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Measurement ID"
                        value={settings.googleAnalyticsSettings.measurementId}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.measurementId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="API Secret"
                        type="password"
                        value={settings.googleAnalyticsSettings.apiSecret}
                        onChange={(e) =>
                          handleInputChange('googleAnalyticsSettings.apiSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableEnhancedMeasurement}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableEnhancedMeasurement', e.target.checked)
                            }
                          />
                        }
                        label="Bật đo lường nâng cao"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableUserTiming}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableUserTiming', e.target.checked)
                            }
                          />
                        }
                        label="Bật thời gian người dùng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableExceptionTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableExceptionTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi ngoại lệ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableLinkTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableLinkTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi liên kết"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableFormTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableFormTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi biểu mẫu"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableVideoTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableVideoTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi video"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableScrollTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableScrollTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi cuộn"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableFileDownloadTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableFileDownloadTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi tải xuống"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableOutboundLinkTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableOutboundLinkTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi liên kết ngoài"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableSiteSearchTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableSiteSearchTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi tìm kiếm"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableSocialTracking}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableSocialTracking', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi mạng xã hội"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleAnalyticsSettings.enableCustomEvents}
                            onChange={(e) =>
                              handleInputChange('googleAnalyticsSettings.enableCustomEvents', e.target.checked)
                            }
                          />
                        }
                        label="Bật sự kiện tùy chỉnh"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Google Tag Manager */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Google Tag Manager"
              subheader="Cấu hình tích hợp Google Tag Manager"
              avatar={<GoogleIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.googleTagManagerSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('googleTagManagerSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật Google Tag Manager"
                  />
                </Grid>
                {settings.googleTagManagerSettings.enabled && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Container ID"
                        value={settings.googleTagManagerSettings.containerId}
                        onChange={(e) =>
                          handleInputChange('googleTagManagerSettings.containerId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enablePreviewMode}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enablePreviewMode', e.target.checked)
                            }
                          />
                        }
                        label="Bật chế độ xem trước"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enableDebugMode}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enableDebugMode', e.target.checked)
                            }
                          />
                        }
                        label="Bật chế độ gỡ lỗi"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enableDataLayer}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enableDataLayer', e.target.checked)
                            }
                          />
                        }
                        label="Bật Data Layer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enableCustomEvents}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enableCustomEvents', e.target.checked)
                            }
                          />
                        }
                        label="Bật sự kiện tùy chỉnh"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enableUserVariables}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enableUserVariables', e.target.checked)
                            }
                          />
                        }
                        label="Bật biến người dùng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.googleTagManagerSettings.enableEcommerceVariables}
                            onChange={(e) =>
                              handleInputChange('googleTagManagerSettings.enableEcommerceVariables', e.target.checked)
                            }
                          />
                        }
                        label="Bật biến thương mại điện tử"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Facebook Pixel */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Facebook Pixel"
              subheader="Cấu hình tích hợp Facebook Pixel"
              avatar={<FacebookIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.facebookPixelSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('facebookPixelSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật Facebook Pixel"
                  />
                </Grid>
                {settings.facebookPixelSettings.enabled && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Pixel ID"
                        value={settings.facebookPixelSettings.pixelId}
                        onChange={(e) =>
                          handleInputChange('facebookPixelSettings.pixelId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableAdvancedMatching}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableAdvancedMatching', e.target.checked)
                            }
                          />
                        }
                        label="Bật khớp nâng cao"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableAutomaticConfig}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableAutomaticConfig', e.target.checked)
                            }
                          />
                        }
                        label="Bật cấu hình tự động"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableCustomEvents}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableCustomEvents', e.target.checked)
                            }
                          />
                        }
                        label="Bật sự kiện tùy chỉnh"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableViewContent}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableViewContent', e.target.checked)
                            }
                          />
                        }
                        label="Bật xem nội dung"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableAddToCart}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableAddToCart', e.target.checked)
                            }
                          />
                        }
                        label="Bật thêm vào giỏ hàng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableInitiateCheckout}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableInitiateCheckout', e.target.checked)
                            }
                          />
                        }
                        label="Bật bắt đầu thanh toán"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enablePurchase}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enablePurchase', e.target.checked)
                            }
                          />
                        }
                        label="Bật mua hàng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableLead}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableLead', e.target.checked)
                            }
                          />
                        }
                        label="Bật khách hàng tiềm năng"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookPixelSettings.enableCompleteRegistration}
                            onChange={(e) =>
                              handleInputChange('facebookPixelSettings.enableCompleteRegistration', e.target.checked)
                            }
                          />
                        }
                        label="Bật hoàn tất đăng ký"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt khác */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt khác"
              subheader="Cấu hình các tùy chọn khác"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableHeatmaps}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableHeatmaps', e.target.checked)
                        }
                      />
                    }
                    label="Bật bản đồ nhiệt"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableSessionRecording}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableSessionRecording', e.target.checked)
                        }
                      />
                    }
                    label="Bật ghi phiên"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableABTesting}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableABTesting', e.target.checked)
                        }
                      />
                    }
                    label="Bật A/B Testing"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableConversionFunnels}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableConversionFunnels', e.target.checked)
                        }
                      />
                    }
                    label="Bật phễu chuyển đổi"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableGoalTracking}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableGoalTracking', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi mục tiêu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableCustomReports}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableCustomReports', e.target.checked)
                        }
                      />
                    }
                    label="Bật báo cáo tùy chỉnh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableDataExport}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableDataExport', e.target.checked)
                        }
                      />
                    }
                    label="Bật xuất dữ liệu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableAPI}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableAPI', e.target.checked)
                        }
                      />
                    }
                    label="Bật API"
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

export default AnalyticsSettings; 