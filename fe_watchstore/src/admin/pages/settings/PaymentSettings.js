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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PaymentSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showKeys, setShowKeys] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [isNewProvider, setIsNewProvider] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      currency: 'VND',
      decimalPlaces: 0,
      decimalSeparator: ',',
      thousandsSeparator: '.',
      currencyPosition: 'after',
      transactionFee: 0,
      minPaymentAmount: 10000,
      maxPaymentAmount: 100000000,
    },
    providers: {
      vnpay: {
        enabled: true,
        displayName: 'VNPay',
        description: 'Thanh toán trực tuyến qua VNPay',
        merchantId: '',
        secretKey: '',
        returnUrl: 'http://localhost:3000/payment/return',
        testMode: true,
        sortOrder: 1,
      },
      momo: {
        enabled: true,
        displayName: 'MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        partnerId: '',
        accessKey: '',
        secretKey: '',
        returnUrl: 'http://localhost:3000/payment/return',
        testMode: true,
        sortOrder: 2,
      },
      zalopay: {
        enabled: false,
        displayName: 'ZaloPay',
        description: 'Thanh toán qua ví ZaloPay',
        appId: '',
        key1: '',
        key2: '',
        returnUrl: 'http://localhost:3000/payment/return',
        testMode: true,
        sortOrder: 3,
      },
      cod: {
        enabled: true,
        displayName: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán tiền mặt khi nhận hàng',
        codFee: 0,
        minimumOrder: 0,
        maximumOrder: 10000000,
        sortOrder: 4,
      },
      bankTransfer: {
        enabled: true,
        displayName: 'Chuyển khoản ngân hàng',
        description: 'Thanh toán qua chuyển khoản ngân hàng',
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CÔNG TY TNHH WATCHSTORE',
        branch: 'Chi nhánh Hà Nội',
        instructions: 'Vui lòng ghi rõ mã đơn hàng trong nội dung chuyển khoản',
        sortOrder: 5,
      },
    },
    tax: {
      enableTax: true,
      taxName: 'VAT',
      taxType: 'percent',
      taxValue: 10,
      includeTaxInPrice: true,
      showTaxSeparately: true,
    },
  });

  const [newProviderTemplate, setNewProviderTemplate] = useState({
    id: '',
    enabled: true,
    displayName: '',
    description: '',
    testMode: true,
    sortOrder: Object.keys(settings.providers).length + 1,
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
      const response = await fetch('http://localhost:8080/api/admin/settings/payment', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt thanh toán');
      }

      const data = await response.json();
      setSettings(data);
      
      // Initialize showKeys state
      const keys = {};
      Object.keys(data.providers).forEach(provider => {
        keys[provider] = false;
      });
      setShowKeys(keys);
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

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleProviderInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setCurrentProvider(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleShowKey = useCallback((providerId) => {
    setShowKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  }, []);

  const handleOpenDialog = useCallback((provider = null) => {
    if (provider) {
      setCurrentProvider(provider);
      setIsNewProvider(false);
    } else {
      setCurrentProvider(newProviderTemplate);
      setIsNewProvider(true);
    }
    setOpenDialog(true);
  }, [newProviderTemplate]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentProvider(null);
    setIsNewProvider(false);
  }, []);

  const handleSaveProvider = useCallback(() => {
    if (isNewProvider) {
      setSettings(prev => ({
        ...prev,
        paymentProviders: [...prev.paymentProviders, currentProvider]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        paymentProviders: prev.paymentProviders.map(provider => 
          provider.id === currentProvider.id ? currentProvider : provider
        )
      }));
    }
    handleCloseDialog();
  }, [currentProvider, isNewProvider, handleCloseDialog]);

  const handleDeleteProvider = useCallback((providerId) => {
    setSettings(prev => ({
      ...prev,
      paymentProviders: prev.paymentProviders.filter(provider => provider.id !== providerId)
    }));
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleChangeGeneral = (field, value) => {
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [field]: value,
      },
    });
  };

  const handleChangeTax = (field, value) => {
    setSettings({
      ...settings,
      tax: {
        ...settings.tax,
        [field]: value,
      },
    });
  };

  const handleChangeProvider = (providerId, field, value) => {
    setSettings({
      ...settings,
      providers: {
        ...settings.providers,
        [providerId]: {
          ...settings.providers[providerId],
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt thanh toán');
      }

      showSnackbar('Cài đặt thanh toán đã được lưu thành công', 'success');
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

  // Thay thế các hàm cũ bằng các hàm mới
  const handleChangeCurrentProvider = handleProviderInputChange;
  const toggleShowKey = handleShowKey;
  const openProviderDialog = handleOpenDialog;
  const closeProviderDialog = handleCloseDialog;
  const saveProvider = handleSaveProvider;
  const deleteProvider = handleDeleteProvider;
  const handleCloseSnackbar = handleSnackbarClose;

  if (loading && !settings.general.currency) {
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
          Cài đặt thanh toán
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
            aria-label="payment settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<PaymentIcon />}
              iconPosition="start"
              label="Cài đặt chung"
            />
            <Tab
              icon={<CreditCardIcon />}
              iconPosition="start"
              label="Phương thức thanh toán"
            />
            <Tab
              icon={<AccountBalanceIcon />}
              iconPosition="start"
              label="Thuế & phí"
            />
          </Tabs>
        </Box>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Đơn vị tiền tệ</InputLabel>
                <Select
                  value={settings.general.currency}
                  label="Đơn vị tiền tệ"
                  onChange={(e) => handleChangeGeneral('currency', e.target.value)}
                >
                  <MenuItem value="VND">VND (₫)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số chữ số thập phân"
                variant="outlined"
                type="number"
                value={settings.general.decimalPlaces}
                onChange={(e) => handleChangeGeneral('decimalPlaces', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dấu phân cách thập phân"
                variant="outlined"
                value={settings.general.decimalSeparator}
                onChange={(e) => handleChangeGeneral('decimalSeparator', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dấu phân cách hàng nghìn"
                variant="outlined"
                value={settings.general.thousandsSeparator}
                onChange={(e) => handleChangeGeneral('thousandsSeparator', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vị trí ký hiệu tiền tệ</InputLabel>
                <Select
                  value={settings.general.currencyPosition}
                  label="Vị trí ký hiệu tiền tệ"
                  onChange={(e) => handleChangeGeneral('currencyPosition', e.target.value)}
                >
                  <MenuItem value="before">Trước số tiền (ví dụ: ₫100.000)</MenuItem>
                  <MenuItem value="after">Sau số tiền (ví dụ: 100.000₫)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phí giao dịch (%)"
                variant="outlined"
                type="number"
                value={settings.general.transactionFee}
                onChange={(e) => handleChangeGeneral('transactionFee', parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tiền thanh toán tối thiểu"
                variant="outlined"
                type="number"
                value={settings.general.minPaymentAmount}
                onChange={(e) => handleChangeGeneral('minPaymentAmount', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tiền thanh toán tối đa"
                variant="outlined"
                type="number"
                value={settings.general.maxPaymentAmount}
                onChange={(e) => handleChangeGeneral('maxPaymentAmount', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payment Providers Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => openProviderDialog()}
            >
              Thêm phương thức thanh toán
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phương thức thanh toán</TableCell>
                  <TableCell>Tên hiển thị</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thứ tự</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(settings.providers).map((providerId) => {
                  const provider = settings.providers[providerId];
                  return (
                    <TableRow key={providerId}>
                      <TableCell>{providerId}</TableCell>
                      <TableCell>{provider.displayName}</TableCell>
                      <TableCell>
                        <Switch
                          checked={provider.enabled}
                          onChange={(e) => handleChangeProvider(providerId, 'enabled', e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{provider.sortOrder}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => openProviderDialog(providerId)}
                        >
                          <EditIcon />
                        </IconButton>
                        {providerId !== 'cod' && providerId !== 'bankTransfer' && (
                          <IconButton
                            color="error"
                            onClick={() => deleteProvider(providerId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tax & Fees Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.tax.enableTax}
                    onChange={(e) => handleChangeTax('enableTax', e.target.checked)}
                    color="primary"
                  />
                }
                label="Kích hoạt tính thuế"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên thuế"
                variant="outlined"
                value={settings.tax.taxName}
                onChange={(e) => handleChangeTax('taxName', e.target.value)}
                disabled={!settings.tax.enableTax}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!settings.tax.enableTax}>
                <InputLabel>Loại thuế</InputLabel>
                <Select
                  value={settings.tax.taxType}
                  label="Loại thuế"
                  onChange={(e) => handleChangeTax('taxType', e.target.value)}
                >
                  <MenuItem value="percent">Phần trăm (%)</MenuItem>
                  <MenuItem value="fixed">Giá trị cố định</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={settings.tax.taxType === 'percent' ? 'Giá trị thuế (%)' : 'Giá trị thuế'}
                variant="outlined"
                type="number"
                value={settings.tax.taxValue}
                onChange={(e) => handleChangeTax('taxValue', parseFloat(e.target.value))}
                disabled={!settings.tax.enableTax}
                InputProps={{
                  endAdornment: settings.tax.taxType === 'percent' ? (
                    <InputAdornment position="end">%</InputAdornment>
                  ) : (
                    <InputAdornment position="end">₫</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.tax.includeTaxInPrice}
                    onChange={(e) => handleChangeTax('includeTaxInPrice', e.target.checked)}
                    color="primary"
                    disabled={!settings.tax.enableTax}
                  />
                }
                label="Giá hiển thị đã bao gồm thuế"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.tax.showTaxSeparately}
                    onChange={(e) => handleChangeTax('showTaxSeparately', e.target.checked)}
                    color="primary"
                    disabled={!settings.tax.enableTax}
                  />
                }
                label="Hiển thị thuế tách biệt trong đơn hàng"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Provider Dialog */}
      {currentProvider && (
        <Dialog
          open={openDialog}
          onClose={closeProviderDialog}
          aria-labelledby="provider-dialog-title"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle id="provider-dialog-title">
            {isNewProvider ? 'Thêm phương thức thanh toán mới' : `Chỉnh sửa phương thức thanh toán: ${currentProvider.displayName}`}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {isNewProvider && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID phương thức thanh toán"
                    variant="outlined"
                    value={currentProvider.id}
                    onChange={(e) => handleChangeCurrentProvider('id', e.target.value)}
                    required
                    helperText="ID phải là duy nhất, không chứa ký tự đặc biệt và khoảng trắng"
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên hiển thị"
                  variant="outlined"
                  value={currentProvider.displayName}
                  onChange={(e) => handleChangeCurrentProvider('displayName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thứ tự hiển thị"
                  variant="outlined"
                  type="number"
                  value={currentProvider.sortOrder}
                  onChange={(e) => handleChangeCurrentProvider('sortOrder', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={currentProvider.description}
                  onChange={(e) => handleChangeCurrentProvider('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProvider.enabled}
                      onChange={(e) => handleChangeCurrentProvider('enabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Kích hoạt phương thức thanh toán này"
                />
              </Grid>

              {/* Dynamic fields for different provider types */}
              {currentProvider.id === 'vnpay' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Merchant ID"
                      variant="outlined"
                      value={currentProvider.merchantId}
                      onChange={(e) => handleChangeCurrentProvider('merchantId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="vnpay-secretKey">Secret Key</InputLabel>
                      <OutlinedInput
                        id="vnpay-secretKey"
                        type={showKeys.vnpay ? 'text' : 'password'}
                        value={currentProvider.secretKey}
                        onChange={(e) => handleChangeCurrentProvider('secretKey', e.target.value)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => toggleShowKey('vnpay')}
                              edge="end"
                            >
                              {showKeys.vnpay ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Secret Key"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Return URL"
                      variant="outlined"
                      value={currentProvider.returnUrl}
                      onChange={(e) => handleChangeCurrentProvider('returnUrl', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentProvider.testMode}
                          onChange={(e) => handleChangeCurrentProvider('testMode', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Chế độ thử nghiệm"
                    />
                  </Grid>
                </>
              )}

              {currentProvider.id === 'momo' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Partner ID"
                      variant="outlined"
                      value={currentProvider.partnerId}
                      onChange={(e) => handleChangeCurrentProvider('partnerId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Access Key"
                      variant="outlined"
                      value={currentProvider.accessKey}
                      onChange={(e) => handleChangeCurrentProvider('accessKey', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="momo-secretKey">Secret Key</InputLabel>
                      <OutlinedInput
                        id="momo-secretKey"
                        type={showKeys.momo ? 'text' : 'password'}
                        value={currentProvider.secretKey}
                        onChange={(e) => handleChangeCurrentProvider('secretKey', e.target.value)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => toggleShowKey('momo')}
                              edge="end"
                            >
                              {showKeys.momo ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Secret Key"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Return URL"
                      variant="outlined"
                      value={currentProvider.returnUrl}
                      onChange={(e) => handleChangeCurrentProvider('returnUrl', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentProvider.testMode}
                          onChange={(e) => handleChangeCurrentProvider('testMode', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Chế độ thử nghiệm"
                    />
                  </Grid>
                </>
              )}

              {currentProvider.id === 'zalopay' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="App ID"
                      variant="outlined"
                      value={currentProvider.appId}
                      onChange={(e) => handleChangeCurrentProvider('appId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="zalopay-key1">Key 1</InputLabel>
                      <OutlinedInput
                        id="zalopay-key1"
                        type={showKeys.zalopay ? 'text' : 'password'}
                        value={currentProvider.key1}
                        onChange={(e) => handleChangeCurrentProvider('key1', e.target.value)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => toggleShowKey('zalopay')}
                              edge="end"
                            >
                              {showKeys.zalopay ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Key 1"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="zalopay-key2">Key 2</InputLabel>
                      <OutlinedInput
                        id="zalopay-key2"
                        type={showKeys.zalopay ? 'text' : 'password'}
                        value={currentProvider.key2}
                        onChange={(e) => handleChangeCurrentProvider('key2', e.target.value)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => toggleShowKey('zalopay')}
                              edge="end"
                            >
                              {showKeys.zalopay ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Key 2"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Return URL"
                      variant="outlined"
                      value={currentProvider.returnUrl}
                      onChange={(e) => handleChangeCurrentProvider('returnUrl', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentProvider.testMode}
                          onChange={(e) => handleChangeCurrentProvider('testMode', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Chế độ thử nghiệm"
                    />
                  </Grid>
                </>
              )}

              {currentProvider.id === 'cod' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phí COD"
                      variant="outlined"
                      type="number"
                      value={currentProvider.codFee}
                      onChange={(e) => handleChangeCurrentProvider('codFee', parseFloat(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Đơn hàng tối thiểu"
                      variant="outlined"
                      type="number"
                      value={currentProvider.minimumOrder}
                      onChange={(e) => handleChangeCurrentProvider('minimumOrder', parseFloat(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Đơn hàng tối đa"
                      variant="outlined"
                      type="number"
                      value={currentProvider.maximumOrder}
                      onChange={(e) => handleChangeCurrentProvider('maximumOrder', parseFloat(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                      }}
                    />
                  </Grid>
                </>
              )}

              {currentProvider.id === 'bankTransfer' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tên ngân hàng"
                      variant="outlined"
                      value={currentProvider.bankName}
                      onChange={(e) => handleChangeCurrentProvider('bankName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Chi nhánh"
                      variant="outlined"
                      value={currentProvider.branch}
                      onChange={(e) => handleChangeCurrentProvider('branch', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Số tài khoản"
                      variant="outlined"
                      value={currentProvider.accountNumber}
                      onChange={(e) => handleChangeCurrentProvider('accountNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tên chủ tài khoản"
                      variant="outlined"
                      value={currentProvider.accountName}
                      onChange={(e) => handleChangeCurrentProvider('accountName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hướng dẫn chuyển khoản"
                      variant="outlined"
                      multiline
                      rows={2}
                      value={currentProvider.instructions}
                      onChange={(e) => handleChangeCurrentProvider('instructions', e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeProviderDialog} color="primary">
              Hủy
            </Button>
            <Button
              onClick={saveProvider}
              color="primary"
              variant="contained"
              disabled={isNewProvider && !currentProvider.id}
            >
              {isNewProvider ? 'Thêm mới' : 'Cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

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

export default PaymentSettings; 