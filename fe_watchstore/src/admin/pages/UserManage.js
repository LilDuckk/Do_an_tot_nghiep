import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import '../../assets/css/admin/pages/UserManage.css';

const UserManage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      role: 'user',
      status: 'active',
    },
    {
      id: 2,
      firstName: 'Trần',
      lastName: 'Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      role: 'admin',
      status: 'active',
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
  });

  const handleOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  return (
    <Container className="user-container">
      <Typography variant="h4" component="h1" className="user-header">
        Quản lý người dùng
      </Typography>

      <TableContainer component={Paper}>
        <Table className="user-table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Họ</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell className="action-cell">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</TableCell>
                <TableCell>{user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="firstName"
            label="Họ"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Tên"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Số điện thoại"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Vai trò</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Vai trò"
            >
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="admin">Quản trị viên</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Đã khóa</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManage; 