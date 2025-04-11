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
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const SocialSettings = () => {
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
      enableSocialLogin: true,
      enableSocialShare: true,
      enableSocialComments: true,
      enableSocialFollow: true,
      defaultShareImage: 'https://watchstore.com/images/share-default.png',
      shareTitle: 'WatchStore - Đồng hồ chính hãng',
      shareDescription: 'Khám phá bộ sưu tập đồng hồ chính hãng tại WatchStore',
    },

    // Cài đặt Facebook
    facebookSettings: {
      enabled: true,
      appId: 'your-facebook-app-id',
      appSecret: 'your-facebook-app-secret',
      pageId: 'your-facebook-page-id',
      pageUrl: 'https://facebook.com/watchstore',
      enableLogin: true,
      enableShare: true,
      enableComments: true,
      enableFollow: true,
    },

    // Cài đặt Twitter
    twitterSettings: {
      enabled: true,
      apiKey: 'your-twitter-api-key',
      apiSecret: 'your-twitter-api-secret',
      accessToken: 'your-twitter-access-token',
      accessTokenSecret: 'your-twitter-access-token-secret',
      username: '@watchstore',
      enableLogin: true,
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt Instagram
    instagramSettings: {
      enabled: true,
      clientId: 'your-instagram-client-id',
      clientSecret: 'your-instagram-client-secret',
      username: '@watchstore',
      enableLogin: true,
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt YouTube
    youtubeSettings: {
      enabled: true,
      apiKey: 'your-youtube-api-key',
      channelId: 'your-youtube-channel-id',
      channelUrl: 'https://youtube.com/watchstore',
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt LinkedIn
    linkedinSettings: {
      enabled: true,
      clientId: 'your-linkedin-client-id',
      clientSecret: 'your-linkedin-client-secret',
      companyId: 'your-linkedin-company-id',
      companyUrl: 'https://linkedin.com/company/watchstore',
      enableLogin: true,
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt Pinterest
    pinterestSettings: {
      enabled: true,
      appId: 'your-pinterest-app-id',
      username: '@watchstore',
      boardUrl: 'https://pinterest.com/watchstore',
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt WhatsApp
    whatsappSettings: {
      enabled: true,
      phoneNumber: '+84123456789',
      message: 'Chào mừng đến với WatchStore!',
      enableShare: true,
    },

    // Cài đặt Telegram
    telegramSettings: {
      enabled: true,
      botToken: 'your-telegram-bot-token',
      channelId: '@watchstore',
      enableShare: true,
      enableFollow: true,
    },

    // Cài đặt khác
    otherSettings: {
      enableOpenGraph: true,
      enableTwitterCards: true,
      enableSocialMetaTags: true,
      enableSocialAnalytics: true,
      enableSocialPixel: true,
      enableSocialConversion: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/social', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt mạng xã hội');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/social', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt mạng xã hội');
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
          <ShareIcon color="primary" />
          Cài đặt mạng xã hội
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
                        checked={settings.generalSettings.enableSocialLogin}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSocialLogin', e.target.checked)
                        }
                      />
                    }
                    label="Bật đăng nhập bằng mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableSocialShare}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSocialShare', e.target.checked)
                        }
                      />
                    }
                    label="Bật chia sẻ lên mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableSocialComments}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSocialComments', e.target.checked)
                        }
                      />
                    }
                    label="Bật bình luận từ mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableSocialFollow}
                        onChange={(e) =>
                          handleInputChange('generalSettings.enableSocialFollow', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi trên mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hình ảnh chia sẻ mặc định"
                    value={settings.generalSettings.defaultShareImage}
                    onChange={(e) =>
                      handleInputChange('generalSettings.defaultShareImage', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề chia sẻ"
                    value={settings.generalSettings.shareTitle}
                    onChange={(e) =>
                      handleInputChange('generalSettings.shareTitle', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả chia sẻ"
                    multiline
                    rows={2}
                    value={settings.generalSettings.shareDescription}
                    onChange={(e) =>
                      handleInputChange('generalSettings.shareDescription', e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Facebook */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Facebook"
              subheader="Cấu hình tích hợp Facebook"
              avatar={<FacebookIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.facebookSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('facebookSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp Facebook"
                  />
                </Grid>
                {settings.facebookSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="App ID"
                        value={settings.facebookSettings.appId}
                        onChange={(e) =>
                          handleInputChange('facebookSettings.appId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="App Secret"
                        type="password"
                        value={settings.facebookSettings.appSecret}
                        onChange={(e) =>
                          handleInputChange('facebookSettings.appSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Page ID"
                        value={settings.facebookSettings.pageId}
                        onChange={(e) =>
                          handleInputChange('facebookSettings.pageId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Page URL"
                        value={settings.facebookSettings.pageUrl}
                        onChange={(e) =>
                          handleInputChange('facebookSettings.pageUrl', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookSettings.enableLogin}
                            onChange={(e) =>
                              handleInputChange('facebookSettings.enableLogin', e.target.checked)
                            }
                          />
                        }
                        label="Bật đăng nhập"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('facebookSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.facebookSettings.enableComments}
                            onChange={(e) =>
                              handleInputChange('facebookSettings.enableComments', e.target.checked)
                            }
                          />
                        }
                        label="Bật bình luận"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Twitter */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Twitter"
              subheader="Cấu hình tích hợp Twitter"
              avatar={<TwitterIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twitterSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp Twitter"
                  />
                </Grid>
                {settings.twitterSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={settings.twitterSettings.apiKey}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.apiKey', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="API Secret"
                        type="password"
                        value={settings.twitterSettings.apiSecret}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.apiSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Access Token"
                        value={settings.twitterSettings.accessToken}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.accessToken', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Access Token Secret"
                        type="password"
                        value={settings.twitterSettings.accessTokenSecret}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.accessTokenSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={settings.twitterSettings.username}
                        onChange={(e) =>
                          handleInputChange('twitterSettings.username', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.twitterSettings.enableLogin}
                            onChange={(e) =>
                              handleInputChange('twitterSettings.enableLogin', e.target.checked)
                            }
                          />
                        }
                        label="Bật đăng nhập"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.twitterSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('twitterSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.twitterSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('twitterSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Instagram */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Instagram"
              subheader="Cấu hình tích hợp Instagram"
              avatar={<InstagramIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.instagramSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('instagramSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp Instagram"
                  />
                </Grid>
                {settings.instagramSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client ID"
                        value={settings.instagramSettings.clientId}
                        onChange={(e) =>
                          handleInputChange('instagramSettings.clientId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client Secret"
                        type="password"
                        value={settings.instagramSettings.clientSecret}
                        onChange={(e) =>
                          handleInputChange('instagramSettings.clientSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={settings.instagramSettings.username}
                        onChange={(e) =>
                          handleInputChange('instagramSettings.username', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.instagramSettings.enableLogin}
                            onChange={(e) =>
                              handleInputChange('instagramSettings.enableLogin', e.target.checked)
                            }
                          />
                        }
                        label="Bật đăng nhập"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.instagramSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('instagramSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.instagramSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('instagramSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt YouTube */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt YouTube"
              subheader="Cấu hình tích hợp YouTube"
              avatar={<YouTubeIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.youtubeSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('youtubeSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp YouTube"
                  />
                </Grid>
                {settings.youtubeSettings.enabled && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={settings.youtubeSettings.apiKey}
                        onChange={(e) =>
                          handleInputChange('youtubeSettings.apiKey', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Channel ID"
                        value={settings.youtubeSettings.channelId}
                        onChange={(e) =>
                          handleInputChange('youtubeSettings.channelId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Channel URL"
                        value={settings.youtubeSettings.channelUrl}
                        onChange={(e) =>
                          handleInputChange('youtubeSettings.channelUrl', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.youtubeSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('youtubeSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.youtubeSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('youtubeSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt LinkedIn */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt LinkedIn"
              subheader="Cấu hình tích hợp LinkedIn"
              avatar={<LinkedInIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.linkedinSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('linkedinSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp LinkedIn"
                  />
                </Grid>
                {settings.linkedinSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client ID"
                        value={settings.linkedinSettings.clientId}
                        onChange={(e) =>
                          handleInputChange('linkedinSettings.clientId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client Secret"
                        type="password"
                        value={settings.linkedinSettings.clientSecret}
                        onChange={(e) =>
                          handleInputChange('linkedinSettings.clientSecret', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company ID"
                        value={settings.linkedinSettings.companyId}
                        onChange={(e) =>
                          handleInputChange('linkedinSettings.companyId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company URL"
                        value={settings.linkedinSettings.companyUrl}
                        onChange={(e) =>
                          handleInputChange('linkedinSettings.companyUrl', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.linkedinSettings.enableLogin}
                            onChange={(e) =>
                              handleInputChange('linkedinSettings.enableLogin', e.target.checked)
                            }
                          />
                        }
                        label="Bật đăng nhập"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.linkedinSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('linkedinSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.linkedinSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('linkedinSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Pinterest */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Pinterest"
              subheader="Cấu hình tích hợp Pinterest"
              avatar={<PinterestIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pinterestSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('pinterestSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp Pinterest"
                  />
                </Grid>
                {settings.pinterestSettings.enabled && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="App ID"
                        value={settings.pinterestSettings.appId}
                        onChange={(e) =>
                          handleInputChange('pinterestSettings.appId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={settings.pinterestSettings.username}
                        onChange={(e) =>
                          handleInputChange('pinterestSettings.username', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Board URL"
                        value={settings.pinterestSettings.boardUrl}
                        onChange={(e) =>
                          handleInputChange('pinterestSettings.boardUrl', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pinterestSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('pinterestSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pinterestSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('pinterestSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt WhatsApp */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt WhatsApp"
              subheader="Cấu hình tích hợp WhatsApp"
              avatar={<WhatsAppIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.whatsappSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('whatsappSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp WhatsApp"
                  />
                </Grid>
                {settings.whatsappSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={settings.whatsappSettings.phoneNumber}
                        onChange={(e) =>
                          handleInputChange('whatsappSettings.phoneNumber', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tin nhắn mặc định"
                        value={settings.whatsappSettings.message}
                        onChange={(e) =>
                          handleInputChange('whatsappSettings.message', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.whatsappSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('whatsappSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt Telegram */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt Telegram"
              subheader="Cấu hình tích hợp Telegram"
              avatar={<TelegramIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.telegramSettings.enabled}
                        onChange={(e) =>
                          handleInputChange('telegramSettings.enabled', e.target.checked)
                        }
                      />
                    }
                    label="Bật tích hợp Telegram"
                  />
                </Grid>
                {settings.telegramSettings.enabled && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bot Token"
                        value={settings.telegramSettings.botToken}
                        onChange={(e) =>
                          handleInputChange('telegramSettings.botToken', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Channel ID"
                        value={settings.telegramSettings.channelId}
                        onChange={(e) =>
                          handleInputChange('telegramSettings.channelId', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.telegramSettings.enableShare}
                            onChange={(e) =>
                              handleInputChange('telegramSettings.enableShare', e.target.checked)
                            }
                          />
                        }
                        label="Bật chia sẻ"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.telegramSettings.enableFollow}
                            onChange={(e) =>
                              handleInputChange('telegramSettings.enableFollow', e.target.checked)
                            }
                          />
                        }
                        label="Bật theo dõi"
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
                        checked={settings.otherSettings.enableOpenGraph}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableOpenGraph', e.target.checked)
                        }
                      />
                    }
                    label="Bật Open Graph"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableTwitterCards}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableTwitterCards', e.target.checked)
                        }
                      />
                    }
                    label="Bật Twitter Cards"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableSocialMetaTags}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableSocialMetaTags', e.target.checked)
                        }
                      />
                    }
                    label="Bật thẻ meta mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableSocialAnalytics}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableSocialAnalytics', e.target.checked)
                        }
                      />
                    }
                    label="Bật phân tích mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableSocialPixel}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableSocialPixel', e.target.checked)
                        }
                      />
                    }
                    label="Bật pixel mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.otherSettings.enableSocialConversion}
                        onChange={(e) =>
                          handleInputChange('otherSettings.enableSocialConversion', e.target.checked)
                        }
                      />
                    }
                    label="Bật theo dõi chuyển đổi"
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

export default SocialSettings; 