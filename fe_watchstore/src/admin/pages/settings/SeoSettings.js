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
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const SeoSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Cài đặt meta chung
    metaSettings: {
      siteTitle: 'WatchStore - Đồng hồ chính hãng',
      siteDescription: 'WatchStore - Cửa hàng đồng hồ chính hãng uy tín, giá tốt nhất thị trường',
      siteKeywords: 'đồng hồ, watch, đồng hồ chính hãng, đồng hồ nam, đồng hồ nữ',
      siteAuthor: 'WatchStore',
      siteLanguage: 'vi-VN',
      siteRobots: 'index, follow',
      siteCanonical: 'https://watchstore.com',
    },

    // Cài đặt Open Graph
    openGraphSettings: {
      enableOpenGraph: true,
      ogTitle: 'WatchStore - Đồng hồ chính hãng',
      ogDescription: 'WatchStore - Cửa hàng đồng hồ chính hãng uy tín, giá tốt nhất thị trường',
      ogType: 'website',
      ogImage: 'https://watchstore.com/images/og-image.jpg',
      ogUrl: 'https://watchstore.com',
      ogSiteName: 'WatchStore',
    },

    // Cài đặt Twitter Card
    twitterCardSettings: {
      enableTwitterCard: true,
      twitterCard: 'summary_large_image',
      twitterSite: '@watchstore',
      twitterCreator: '@watchstore',
      twitterTitle: 'WatchStore - Đồng hồ chính hãng',
      twitterDescription: 'WatchStore - Cửa hàng đồng hồ chính hãng uy tín, giá tốt nhất thị trường',
      twitterImage: 'https://watchstore.com/images/twitter-image.jpg',
    },

    // Cài đặt Schema.org
    schemaSettings: {
      enableSchema: true,
      organizationName: 'WatchStore',
      organizationLogo: 'https://watchstore.com/images/logo.png',
      organizationPhone: '+84 123 456 789',
      organizationEmail: 'contact@watchstore.com',
      organizationAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
      organizationSocial: {
        facebook: 'https://facebook.com/watchstore',
        twitter: 'https://twitter.com/watchstore',
        instagram: 'https://instagram.com/watchstore',
        youtube: 'https://youtube.com/watchstore',
      },
    },

    // Cài đặt XML Sitemap
    sitemapSettings: {
      enableSitemap: true,
      sitemapUrl: 'https://watchstore.com/sitemap.xml',
      sitemapPriority: 0.8,
      sitemapChangeFreq: 'daily',
      sitemapLastMod: new Date().toISOString(),
    },

    // Cài đặt robots.txt
    robotsSettings: {
      enableRobots: true,
      robotsContent: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://watchstore.com/sitemap.xml`,
    },

    // Cài đặt phân tích
    analyticsSettings: {
      enableGoogleAnalytics: true,
      googleAnalyticsId: 'UA-XXXXXXXXX-X',
      enableGoogleTagManager: true,
      googleTagManagerId: 'GTM-XXXXXXX',
      enableFacebookPixel: true,
      facebookPixelId: 'XXXXXXXXXXXXXXX',
    },
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/seo', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt SEO');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt SEO');
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
          <SearchIcon color="primary" />
          Cài đặt SEO
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
        {/* Cài đặt meta chung */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Meta"
              subheader="Cấu hình thông tin meta cơ bản"
              avatar={<CodeIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề website"
                    value={settings.metaSettings.siteTitle}
                    onChange={(e) => handleInputChange('metaSettings.siteTitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả website"
                    multiline
                    rows={2}
                    value={settings.metaSettings.siteDescription}
                    onChange={(e) => handleInputChange('metaSettings.siteDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Từ khóa"
                    value={settings.metaSettings.siteKeywords}
                    onChange={(e) => handleInputChange('metaSettings.siteKeywords', e.target.value)}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tác giả"
                    value={settings.metaSettings.siteAuthor}
                    onChange={(e) => handleInputChange('metaSettings.siteAuthor', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngôn ngữ"
                    value={settings.metaSettings.siteLanguage}
                    onChange={(e) => handleInputChange('metaSettings.siteLanguage', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Robots"
                    value={settings.metaSettings.siteRobots}
                    onChange={(e) => handleInputChange('metaSettings.siteRobots', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Canonical URL"
                    value={settings.metaSettings.siteCanonical}
                    onChange={(e) => handleInputChange('metaSettings.siteCanonical', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Open Graph */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Open Graph"
              subheader="Cấu hình thẻ meta cho mạng xã hội"
              avatar={<LinkIcon color="primary" />}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.openGraphSettings.enableOpenGraph}
                      onChange={(e) => handleInputChange('openGraphSettings.enableOpenGraph', e.target.checked)}
                    />
                  }
                  label="Bật Open Graph"
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề"
                    value={settings.openGraphSettings.ogTitle}
                    onChange={(e) => handleInputChange('openGraphSettings.ogTitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={2}
                    value={settings.openGraphSettings.ogDescription}
                    onChange={(e) => handleInputChange('openGraphSettings.ogDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loại"
                    value={settings.openGraphSettings.ogType}
                    onChange={(e) => handleInputChange('openGraphSettings.ogType', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hình ảnh"
                    value={settings.openGraphSettings.ogImage}
                    onChange={(e) => handleInputChange('openGraphSettings.ogImage', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="URL"
                    value={settings.openGraphSettings.ogUrl}
                    onChange={(e) => handleInputChange('openGraphSettings.ogUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên website"
                    value={settings.openGraphSettings.ogSiteName}
                    onChange={(e) => handleInputChange('openGraphSettings.ogSiteName', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Twitter Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Twitter Card"
              subheader="Cấu hình thẻ meta cho Twitter"
              avatar={<LinkIcon color="primary" />}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twitterCardSettings.enableTwitterCard}
                      onChange={(e) => handleInputChange('twitterCardSettings.enableTwitterCard', e.target.checked)}
                    />
                  }
                  label="Bật Twitter Card"
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loại thẻ"
                    value={settings.twitterCardSettings.twitterCard}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterCard', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tài khoản Twitter"
                    value={settings.twitterCardSettings.twitterSite}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterSite', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tác giả"
                    value={settings.twitterCardSettings.twitterCreator}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterCreator', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tiêu đề"
                    value={settings.twitterCardSettings.twitterTitle}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterTitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={2}
                    value={settings.twitterCardSettings.twitterDescription}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hình ảnh"
                    value={settings.twitterCardSettings.twitterImage}
                    onChange={(e) => handleInputChange('twitterCardSettings.twitterImage', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Schema.org */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Schema.org"
              subheader="Cấu hình dữ liệu có cấu trúc"
              avatar={<CodeIcon color="primary" />}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.schemaSettings.enableSchema}
                      onChange={(e) => handleInputChange('schemaSettings.enableSchema', e.target.checked)}
                    />
                  }
                  label="Bật Schema.org"
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên tổ chức"
                    value={settings.schemaSettings.organizationName}
                    onChange={(e) => handleInputChange('schemaSettings.organizationName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Logo"
                    value={settings.schemaSettings.organizationLogo}
                    onChange={(e) => handleInputChange('schemaSettings.organizationLogo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={settings.schemaSettings.organizationPhone}
                    onChange={(e) => handleInputChange('schemaSettings.organizationPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={settings.schemaSettings.organizationEmail}
                    onChange={(e) => handleInputChange('schemaSettings.organizationEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={settings.schemaSettings.organizationAddress}
                    onChange={(e) => handleInputChange('schemaSettings.organizationAddress', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Mạng xã hội
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Facebook"
                        value={settings.schemaSettings.organizationSocial.facebook}
                        onChange={(e) => handleInputChange('schemaSettings.organizationSocial.facebook', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Twitter"
                        value={settings.schemaSettings.organizationSocial.twitter}
                        onChange={(e) => handleInputChange('schemaSettings.organizationSocial.twitter', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Instagram"
                        value={settings.schemaSettings.organizationSocial.instagram}
                        onChange={(e) => handleInputChange('schemaSettings.organizationSocial.instagram', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="YouTube"
                        value={settings.schemaSettings.organizationSocial.youtube}
                        onChange={(e) => handleInputChange('schemaSettings.organizationSocial.youtube', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt XML Sitemap */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt XML Sitemap"
              subheader="Cấu hình sitemap cho công cụ tìm kiếm"
              avatar={<LinkIcon color="primary" />}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sitemapSettings.enableSitemap}
                      onChange={(e) => handleInputChange('sitemapSettings.enableSitemap', e.target.checked)}
                    />
                  }
                  label="Bật Sitemap"
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL Sitemap"
                    value={settings.sitemapSettings.sitemapUrl}
                    onChange={(e) => handleInputChange('sitemapSettings.sitemapUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Độ ưu tiên"
                    type="number"
                    value={settings.sitemapSettings.sitemapPriority}
                    onChange={(e) => handleInputChange('sitemapSettings.sitemapPriority', parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tần suất cập nhật"
                    value={settings.sitemapSettings.sitemapChangeFreq}
                    onChange={(e) => handleInputChange('sitemapSettings.sitemapChangeFreq', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt robots.txt */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt robots.txt"
              subheader="Cấu hình quy tắc cho công cụ tìm kiếm"
              avatar={<CodeIcon color="primary" />}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.robotsSettings.enableRobots}
                      onChange={(e) => handleInputChange('robotsSettings.enableRobots', e.target.checked)}
                    />
                  }
                  label="Bật robots.txt"
                />
              }
            />
            <CardContent>
              <TextField
                fullWidth
                label="Nội dung robots.txt"
                multiline
                rows={6}
                value={settings.robotsSettings.robotsContent}
                onChange={(e) => handleInputChange('robotsSettings.robotsContent', e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt phân tích */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt phân tích"
              subheader="Cấu hình công cụ phân tích"
              avatar={<VisibilityIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.analyticsSettings.enableGoogleAnalytics}
                        onChange={(e) => handleInputChange('analyticsSettings.enableGoogleAnalytics', e.target.checked)}
                      />
                    }
                    label="Bật Google Analytics"
                  />
                  <TextField
                    fullWidth
                    label="ID Google Analytics"
                    value={settings.analyticsSettings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('analyticsSettings.googleAnalyticsId', e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.analyticsSettings.enableGoogleTagManager}
                        onChange={(e) => handleInputChange('analyticsSettings.enableGoogleTagManager', e.target.checked)}
                      />
                    }
                    label="Bật Google Tag Manager"
                  />
                  <TextField
                    fullWidth
                    label="ID Google Tag Manager"
                    value={settings.analyticsSettings.googleTagManagerId}
                    onChange={(e) => handleInputChange('analyticsSettings.googleTagManagerId', e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.analyticsSettings.enableFacebookPixel}
                        onChange={(e) => handleInputChange('analyticsSettings.enableFacebookPixel', e.target.checked)}
                      />
                    }
                    label="Bật Facebook Pixel"
                  />
                  <TextField
                    fullWidth
                    label="ID Facebook Pixel"
                    value={settings.analyticsSettings.facebookPixelId}
                    onChange={(e) => handleInputChange('analyticsSettings.facebookPixelId', e.target.value)}
                    sx={{ mt: 1 }}
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

export default SeoSettings; 