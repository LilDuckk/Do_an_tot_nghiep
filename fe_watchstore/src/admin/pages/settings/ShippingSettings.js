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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

const ShippingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Cài đặt vận chuyển chung
    generalSettings: {
      enableShipping: true,
      freeShippingThreshold: 5000000, // VND
      defaultShippingMethod: 'standard',
      allowMultipleShippingAddresses: true,
      allowPickupInStore: true,
      allowInternationalShipping: false,
    },

    // Cài đặt phương thức vận chuyển
    shippingMethods: [
      {
        id: 'standard',
        name: 'Giao hàng tiêu chuẩn',
        description: 'Giao hàng trong 3-5 ngày làm việc',
        cost: 30000,
        minDeliveryDays: 3,
        maxDeliveryDays: 5,
        enabled: true,
      },
      {
        id: 'express',
        name: 'Giao hàng nhanh',
        description: 'Giao hàng trong 1-2 ngày làm việc',
        cost: 50000,
        minDeliveryDays: 1,
        maxDeliveryDays: 2,
        enabled: true,
      },
      {
        id: 'pickup',
        name: 'Nhận tại cửa hàng',
        description: 'Nhận hàng trực tiếp tại cửa hàng',
        cost: 0,
        minDeliveryDays: 0,
        maxDeliveryDays: 0,
        enabled: true,
      },
    ],

    // Cài đặt khu vực vận chuyển
    shippingZones: [
      {
        id: 'north',
        name: 'Miền Bắc',
        regions: ['Hà Nội', 'Hải Phòng', 'Quảng Ninh'],
        shippingMethods: ['standard', 'express', 'pickup'],
        baseCost: 30000,
      },
      {
        id: 'central',
        name: 'Miền Trung',
        regions: ['Đà Nẵng', 'Huế', 'Nha Trang'],
        shippingMethods: ['standard', 'express', 'pickup'],
        baseCost: 40000,
      },
      {
        id: 'south',
        name: 'Miền Nam',
        regions: ['TP.HCM', 'Cần Thơ', 'Vũng Tàu'],
        shippingMethods: ['standard', 'express', 'pickup'],
        baseCost: 35000,
      },
    ],
  });

  const [dialog, setDialog] = useState({
    open: false,
    type: '', // 'add', 'edit', 'delete'
    item: null,
    itemType: '', // 'method', 'zone'
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/shipping', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt vận chuyển');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt vận chuyển');
      }

      showSnackbar('Lưu cài đặt thành công', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleOpenDialog = (type, item = null, itemType) => {
    setDialog({
      open: true,
      type,
      item,
      itemType,
    });
  };

  const handleCloseDialog = () => {
    setDialog({
      open: false,
      type: '',
      item: null,
      itemType: '',
    });
  };

  const handleAddItem = (newItem) => {
    if (dialog.itemType === 'method') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingMethods: [...prevSettings.shippingMethods, newItem],
      }));
    } else if (dialog.itemType === 'zone') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingZones: [...prevSettings.shippingZones, newItem],
      }));
    }
  };

  const handleEditItem = (updatedItem) => {
    if (dialog.itemType === 'method') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingMethods: prevSettings.shippingMethods.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      }));
    } else if (dialog.itemType === 'zone') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingZones: prevSettings.shippingZones.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      }));
    }
  };

  const handleDeleteItem = (itemId) => {
    if (dialog.itemType === 'method') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingMethods: prevSettings.shippingMethods.filter((item) => item.id !== itemId),
      }));
    } else if (dialog.itemType === 'zone') {
      setSettings((prevSettings) => ({
        ...prevSettings,
        shippingZones: prevSettings.shippingZones.filter((item) => item.id !== itemId),
      }));
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
          <ShippingIcon color="primary" />
          Cài đặt vận chuyển
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
              subheader="Cấu hình vận chuyển cơ bản"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.enableShipping}
                        onChange={(e) => handleInputChange('generalSettings.enableShipping', e.target.checked)}
                      />
                    }
                    label="Bật vận chuyển"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngưỡng miễn phí vận chuyển (VND)"
                    type="number"
                    value={settings.generalSettings.freeShippingThreshold}
                    onChange={(e) => handleInputChange('generalSettings.freeShippingThreshold', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Phương thức mặc định</InputLabel>
                    <Select
                      value={settings.generalSettings.defaultShippingMethod}
                      label="Phương thức mặc định"
                      onChange={(e) => handleInputChange('generalSettings.defaultShippingMethod', e.target.value)}
                    >
                      {settings.shippingMethods.map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.allowMultipleShippingAddresses}
                        onChange={(e) => handleInputChange('generalSettings.allowMultipleShippingAddresses', e.target.checked)}
                      />
                    }
                    label="Cho phép nhiều địa chỉ giao hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.allowPickupInStore}
                        onChange={(e) => handleInputChange('generalSettings.allowPickupInStore', e.target.checked)}
                      />
                    }
                    label="Cho phép nhận tại cửa hàng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generalSettings.allowInternationalShipping}
                        onChange={(e) => handleInputChange('generalSettings.allowInternationalShipping', e.target.checked)}
                      />
                    }
                    label="Cho phép vận chuyển quốc tế"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Phương thức vận chuyển */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Phương thức vận chuyển"
              subheader="Quản lý các phương thức vận chuyển"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('add', null, 'method')}
                >
                  Thêm phương thức
                </Button>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên phương thức</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Chi phí (VND)</TableCell>
                      <TableCell>Thời gian giao hàng</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.shippingMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell>{method.name}</TableCell>
                        <TableCell>{method.description}</TableCell>
                        <TableCell>{method.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          {method.minDeliveryDays}-{method.maxDeliveryDays} ngày
                        </TableCell>
                        <TableCell>
                          {method.enabled ? 'Đang hoạt động' : 'Đã tắt'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog('edit', method, 'method')}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDialog('delete', method, 'method')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Khu vực vận chuyển */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Khu vực vận chuyển"
              subheader="Quản lý các khu vực vận chuyển"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('add', null, 'zone')}
                >
                  Thêm khu vực
                </Button>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên khu vực</TableCell>
                      <TableCell>Các tỉnh/thành phố</TableCell>
                      <TableCell>Phương thức vận chuyển</TableCell>
                      <TableCell>Chi phí cơ bản (VND)</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.shippingZones.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell>{zone.name}</TableCell>
                        <TableCell>{zone.regions.join(', ')}</TableCell>
                        <TableCell>
                          {zone.shippingMethods
                            .map(
                              (methodId) =>
                                settings.shippingMethods.find((m) => m.id === methodId)?.name
                            )
                            .join(', ')}
                        </TableCell>
                        <TableCell>{zone.baseCost.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog('edit', zone, 'zone')}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDialog('delete', zone, 'zone')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog thêm/sửa/xóa */}
      <Dialog open={dialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialog.type === 'add' && `Thêm ${dialog.itemType === 'method' ? 'phương thức' : 'khu vực'} mới`}
          {dialog.type === 'edit' && `Sửa ${dialog.itemType === 'method' ? 'phương thức' : 'khu vực'}`}
          {dialog.type === 'delete' && `Xóa ${dialog.itemType === 'method' ? 'phương thức' : 'khu vực'}`}
        </DialogTitle>
        <DialogContent>
          {dialog.type === 'delete' ? (
            <Typography>
              Bạn có chắc chắn muốn xóa {dialog.itemType === 'method' ? 'phương thức' : 'khu vực'} "{dialog.item?.name}"?
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {dialog.itemType === 'method' ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ID phương thức"
                      value={dialog.item?.id || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, id: e.target.value } })}
                      disabled={dialog.type === 'edit'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên phương thức"
                      value={dialog.item?.name || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, name: e.target.value } })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả"
                      value={dialog.item?.description || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, description: e.target.value } })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Chi phí (VND)"
                      type="number"
                      value={dialog.item?.cost || 0}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, cost: parseInt(e.target.value) } })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Thời gian giao hàng tối thiểu (ngày)"
                      type="number"
                      value={dialog.item?.minDeliveryDays || 0}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, minDeliveryDays: parseInt(e.target.value) } })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Thời gian giao hàng tối đa (ngày)"
                      type="number"
                      value={dialog.item?.maxDeliveryDays || 0}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, maxDeliveryDays: parseInt(e.target.value) } })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={dialog.item?.enabled || false}
                          onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, enabled: e.target.checked } })}
                        />
                      }
                      label="Đang hoạt động"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ID khu vực"
                      value={dialog.item?.id || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, id: e.target.value } })}
                      disabled={dialog.type === 'edit'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên khu vực"
                      value={dialog.item?.name || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, name: e.target.value } })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Các tỉnh/thành phố"
                      value={dialog.item?.regions?.join(', ') || ''}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, regions: e.target.value.split(',').map(r => r.trim()) } })}
                      helperText="Phân cách bằng dấu phẩy"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Phương thức vận chuyển</InputLabel>
                      <Select
                        multiple
                        value={dialog.item?.shippingMethods || []}
                        label="Phương thức vận chuyển"
                        onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, shippingMethods: e.target.value } })}
                      >
                        {settings.shippingMethods.map((method) => (
                          <MenuItem key={method.id} value={method.id}>
                            {method.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Chi phí cơ bản (VND)"
                      type="number"
                      value={dialog.item?.baseCost || 0}
                      onChange={(e) => setDialog({ ...dialog, item: { ...dialog.item, baseCost: parseInt(e.target.value) } })}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={() => {
              if (dialog.type === 'add') {
                handleAddItem(dialog.item);
              } else if (dialog.type === 'edit') {
                handleEditItem(dialog.item);
              } else if (dialog.type === 'delete') {
                handleDeleteItem(dialog.item.id);
              }
              handleCloseDialog();
            }}
            color={dialog.type === 'delete' ? 'error' : 'primary'}
          >
            {dialog.type === 'add' && 'Thêm'}
            {dialog.type === 'edit' && 'Lưu'}
            {dialog.type === 'delete' && 'Xóa'}
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

export default ShippingSettings; 