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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
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
  Person as PersonIcon,
} from '@mui/icons-material';

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [settings, setSettings] = useState({
    // Cài đặt đăng ký
    registrationSettings: {
      allowRegistration: true,
      requireEmailVerification: true,
      requireAdminApproval: false,
      defaultRole: 'user',
      minAge: 13,
      allowedDomains: [],
      blockedDomains: [],
      blockedUsernames: [],
    },

    // Cài đặt hồ sơ
    profileSettings: {
      allowProfilePicture: true,
      maxProfilePictureSize: 2, // MB
      allowedProfilePictureTypes: ['jpg', 'jpeg', 'png', 'gif'],
      allowCustomUsername: true,
      allowBio: true,
      allowLocation: true,
      allowWebsite: true,
      allowSocialLinks: true,
    },

    // Cài đặt quyền hạn
    permissionSettings: {
      roles: [
        {
          id: 'admin',
          name: 'Quản trị viên',
          permissions: ['all'],
        },
        {
          id: 'moderator',
          name: 'Điều hành viên',
          permissions: ['manage_users', 'manage_content', 'manage_comments'],
        },
        {
          id: 'user',
          name: 'Người dùng',
          permissions: ['view_content', 'comment', 'rate'],
        },
      ],
      defaultPermissions: ['view_content', 'comment', 'rate'],
    },

    // Cài đặt xác thực
    authenticationSettings: {
      allowRememberMe: true,
      rememberMeDuration: 30, // ngày
      allowPasswordReset: true,
      passwordResetExpiry: 24, // giờ
      allowSocialLogin: true,
      socialProviders: ['google', 'facebook'],
      allowTwoFactorAuth: false,
      twoFactorAuthType: 'email', // email, sms, authenticator
    },
  });

  const [dialog, setDialog] = useState({
    open: false,
    type: '', // 'add', 'edit', 'delete'
    role: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải cài đặt người dùng');
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
      const response = await fetch('http://localhost:8080/api/admin/settings/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Không thể lưu cài đặt người dùng');
      }

      showSnackbar('Lưu cài đặt thành công', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleOpenDialog = (type, role = null) => {
    setDialog({
      open: true,
      type,
      role,
    });
  };

  const handleCloseDialog = () => {
    setDialog({
      open: false,
      type: '',
      role: null,
    });
  };

  const handleAddRole = (newRole) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      permissionSettings: {
        ...prevSettings.permissionSettings,
        roles: [...prevSettings.permissionSettings.roles, newRole],
      },
    }));
  };

  const handleEditRole = (updatedRole) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      permissionSettings: {
        ...prevSettings.permissionSettings,
        roles: prevSettings.permissionSettings.roles.map((role) =>
          role.id === updatedRole.id ? updatedRole : role
        ),
      },
    }));
  };

  const handleDeleteRole = (roleId) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      permissionSettings: {
        ...prevSettings.permissionSettings,
        roles: prevSettings.permissionSettings.roles.filter((role) => role.id !== roleId),
      },
    }));
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
          <PersonIcon color="primary" />
          Cài đặt người dùng
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
        {/* Cài đặt đăng ký */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt đăng ký"
              subheader="Cấu hình quá trình đăng ký người dùng"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.registrationSettings.allowRegistration}
                        onChange={(e) => handleInputChange('registrationSettings.allowRegistration', e.target.checked)}
                      />
                    }
                    label="Cho phép đăng ký"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.registrationSettings.requireEmailVerification}
                        onChange={(e) => handleInputChange('registrationSettings.requireEmailVerification', e.target.checked)}
                      />
                    }
                    label="Yêu cầu xác thực email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.registrationSettings.requireAdminApproval}
                        onChange={(e) => handleInputChange('registrationSettings.requireAdminApproval', e.target.checked)}
                      />
                    }
                    label="Yêu cầu phê duyệt quản trị"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vai trò mặc định</InputLabel>
                    <Select
                      value={settings.registrationSettings.defaultRole}
                      label="Vai trò mặc định"
                      onChange={(e) => handleInputChange('registrationSettings.defaultRole', e.target.value)}
                    >
                      {settings.permissionSettings.roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tuổi tối thiểu"
                    type="number"
                    value={settings.registrationSettings.minAge}
                    onChange={(e) => handleInputChange('registrationSettings.minAge', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên miền được phép"
                    value={settings.registrationSettings.allowedDomains.join(', ')}
                    onChange={(e) => handleInputChange('registrationSettings.allowedDomains', e.target.value.split(',').map(d => d.trim()))}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên miền bị chặn"
                    value={settings.registrationSettings.blockedDomains.join(', ')}
                    onChange={(e) => handleInputChange('registrationSettings.blockedDomains', e.target.value.split(',').map(d => d.trim()))}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên người dùng bị chặn"
                    value={settings.registrationSettings.blockedUsernames.join(', ')}
                    onChange={(e) => handleInputChange('registrationSettings.blockedUsernames', e.target.value.split(',').map(u => u.trim()))}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt hồ sơ */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt hồ sơ"
              subheader="Cấu hình thông tin hồ sơ người dùng"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowProfilePicture}
                        onChange={(e) => handleInputChange('profileSettings.allowProfilePicture', e.target.checked)}
                      />
                    }
                    label="Cho phép ảnh đại diện"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kích thước ảnh tối đa (MB)"
                    type="number"
                    value={settings.profileSettings.maxProfilePictureSize}
                    onChange={(e) => handleInputChange('profileSettings.maxProfilePictureSize', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Định dạng ảnh cho phép"
                    value={settings.profileSettings.allowedProfilePictureTypes.join(', ')}
                    onChange={(e) => handleInputChange('profileSettings.allowedProfilePictureTypes', e.target.value.split(',').map(t => t.trim()))}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowCustomUsername}
                        onChange={(e) => handleInputChange('profileSettings.allowCustomUsername', e.target.checked)}
                      />
                    }
                    label="Cho phép tùy chỉnh tên người dùng"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowBio}
                        onChange={(e) => handleInputChange('profileSettings.allowBio', e.target.checked)}
                      />
                    }
                    label="Cho phép tiểu sử"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowLocation}
                        onChange={(e) => handleInputChange('profileSettings.allowLocation', e.target.checked)}
                      />
                    }
                    label="Cho phép địa điểm"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowWebsite}
                        onChange={(e) => handleInputChange('profileSettings.allowWebsite', e.target.checked)}
                      />
                    }
                    label="Cho phép website"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.profileSettings.allowSocialLinks}
                        onChange={(e) => handleInputChange('profileSettings.allowSocialLinks', e.target.checked)}
                      />
                    }
                    label="Cho phép liên kết mạng xã hội"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cài đặt quyền hạn */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt quyền hạn"
              subheader="Quản lý vai trò và quyền hạn"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('add')}
                >
                  Thêm vai trò
                </Button>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên vai trò</TableCell>
                      <TableCell>Quyền hạn</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.permissionSettings.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.permissions.join(', ')}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog('edit', role)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDialog('delete', role)}
                            disabled={role.id === 'admin'}
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

        {/* Cài đặt xác thực */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Cài đặt xác thực"
              subheader="Cấu hình phương thức đăng nhập và bảo mật"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.authenticationSettings.allowRememberMe}
                        onChange={(e) => handleInputChange('authenticationSettings.allowRememberMe', e.target.checked)}
                      />
                    }
                    label="Cho phép ghi nhớ đăng nhập"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời gian ghi nhớ (ngày)"
                    type="number"
                    value={settings.authenticationSettings.rememberMeDuration}
                    onChange={(e) => handleInputChange('authenticationSettings.rememberMeDuration', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.authenticationSettings.allowPasswordReset}
                        onChange={(e) => handleInputChange('authenticationSettings.allowPasswordReset', e.target.checked)}
                      />
                    }
                    label="Cho phép đặt lại mật khẩu"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thời hạn đặt lại mật khẩu (giờ)"
                    type="number"
                    value={settings.authenticationSettings.passwordResetExpiry}
                    onChange={(e) => handleInputChange('authenticationSettings.passwordResetExpiry', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.authenticationSettings.allowSocialLogin}
                        onChange={(e) => handleInputChange('authenticationSettings.allowSocialLogin', e.target.checked)}
                      />
                    }
                    label="Cho phép đăng nhập mạng xã hội"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nhà cung cấp mạng xã hội"
                    value={settings.authenticationSettings.socialProviders.join(', ')}
                    onChange={(e) => handleInputChange('authenticationSettings.socialProviders', e.target.value.split(',').map(p => p.trim()))}
                    helperText="Phân cách bằng dấu phẩy"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.authenticationSettings.allowTwoFactorAuth}
                        onChange={(e) => handleInputChange('authenticationSettings.allowTwoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Cho phép xác thực hai yếu tố"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại xác thực hai yếu tố</InputLabel>
                    <Select
                      value={settings.authenticationSettings.twoFactorAuthType}
                      label="Loại xác thực hai yếu tố"
                      onChange={(e) => handleInputChange('authenticationSettings.twoFactorAuthType', e.target.value)}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="authenticator">Ứng dụng xác thực</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog thêm/sửa/xóa vai trò */}
      <Dialog open={dialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialog.type === 'add' && 'Thêm vai trò mới'}
          {dialog.type === 'edit' && 'Sửa vai trò'}
          {dialog.type === 'delete' && 'Xóa vai trò'}
        </DialogTitle>
        <DialogContent>
          {dialog.type === 'delete' ? (
            <Typography>
              Bạn có chắc chắn muốn xóa vai trò "{dialog.role?.name}"?
            </Typography>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ID vai trò"
                  value={dialog.role?.id || ''}
                  onChange={(e) => setDialog({ ...dialog, role: { ...dialog.role, id: e.target.value } })}
                  disabled={dialog.type === 'edit'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên vai trò"
                  value={dialog.role?.name || ''}
                  onChange={(e) => setDialog({ ...dialog, role: { ...dialog.role, name: e.target.value } })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quyền hạn"
                  value={dialog.role?.permissions?.join(', ') || ''}
                  onChange={(e) => setDialog({ ...dialog, role: { ...dialog.role, permissions: e.target.value.split(',').map(p => p.trim()) } })}
                  helperText="Phân cách bằng dấu phẩy"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={() => {
              if (dialog.type === 'add') {
                handleAddRole(dialog.role);
              } else if (dialog.type === 'edit') {
                handleEditRole(dialog.role);
              } else if (dialog.type === 'delete') {
                handleDeleteRole(dialog.role.id);
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

export default UserSettings; 