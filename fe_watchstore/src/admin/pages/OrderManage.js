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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const OrderManage = () => {
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data - sẽ được thay thế bằng API call
  const orders = [
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      total: '4,000,000đ',
      status: 'Đang xử lý',
      date: '2024-03-03',
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      total: '2,500,000đ',
      status: 'Đã giao',
      date: '2024-03-02',
    },
  ];

  const handleOpen = (order = null) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setOpen(false);
  };

  const handleSave = () => {
    // Xử lý lưu trạng thái đơn hàng
    handleClose();
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý đơn hàng
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(order)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(order)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? 'Chi tiết đơn hàng' : 'Thêm đơn hàng mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Khách hàng"
            fullWidth
            defaultValue={selectedOrder?.customerName}
          />
          <TextField
            margin="dense"
            label="Tổng tiền"
            fullWidth
            defaultValue={selectedOrder?.total}
          />
          <TextField
            select
            margin="dense"
            label="Trạng thái"
            fullWidth
            defaultValue={selectedOrder?.status}
          >
            <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
            <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
            <MenuItem value="Đang giao">Đang giao</MenuItem>
            <MenuItem value="Đã giao">Đã giao</MenuItem>
            <MenuItem value="Đã hủy">Đã hủy</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Ngày đặt"
            type="date"
            fullWidth
            defaultValue={selectedOrder?.date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManage; 