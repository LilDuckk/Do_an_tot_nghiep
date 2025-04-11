import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

const SupportManage = () => {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'NORMAL',
    category: 'GENERAL',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/support/tickets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setTickets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (ticket = null) => {
    if (ticket) {
      setSelectedTicket(ticket);
      setFormData({
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        assignedTo: ticket.assignedTo || '',
      });
    } else {
      setSelectedTicket(null);
      setFormData({
        subject: '',
        description: '',
        priority: 'NORMAL',
        category: 'GENERAL',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedTicket
        ? `http://localhost:8080/api/admin/support/tickets/${selectedTicket.id}`
        : 'http://localhost:8080/api/admin/support/tickets';
      const method = selectedTicket ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTickets();
        handleCloseDialog();
      } else {
        console.error('Error saving ticket');
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ticket này?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/support/tickets/${ticketId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await fetch(`http://localhost:8080/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ message: replyText }),
      });
      fetchTickets();
      setReplyText('');
    } catch (error) {
      console.error('Error replying to ticket:', error);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await fetch(`http://localhost:8080/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return 'Mới';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'NORMAL':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Cao';
      case 'NORMAL':
        return 'Thường';
      case 'LOW':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'GENERAL':
        return 'Chung';
      case 'PRODUCT':
        return 'Sản phẩm';
      case 'ORDER':
        return 'Đơn hàng';
      case 'PAYMENT':
        return 'Thanh toán';
      case 'SHIPPING':
        return 'Vận chuyển';
      case 'RETURN':
        return 'Đổi trả';
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý hỗ trợ khách hàng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tạo ticket mới
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Độ ưu tiên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Người gán</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{getCategoryText(item.category)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityText(item.priority)}
                        color={getPriorityColor(item.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.assignedTo || 'Chưa gán'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleStatusChange(item.id, 'RESOLVED')}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTicket(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có ticket nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTicket ? 'Chi tiết ticket' : 'Tạo ticket mới'}
        </DialogTitle>
        <DialogContent>
          {selectedTicket ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedTicket.subject}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={getCategoryText(selectedTicket.category)}
                      size="small"
                    />
                    <Chip
                      label={getPriorityText(selectedTicket.priority)}
                      color={getPriorityColor(selectedTicket.priority)}
                      size="small"
                    />
                    <Chip
                      label={getStatusText(selectedTicket.status)}
                      color={getStatusColor(selectedTicket.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedTicket.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Lịch sử hội thoại
                  </Typography>
                  <List>
                    {selectedTicket.messages?.map((message, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {message.isAdmin ? <SupportIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography component="span" variant="subtitle2">
                                {message.isAdmin ? 'Nhân viên hỗ trợ' : selectedTicket.customerName}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary">
                                {formatDateTime(message.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ whiteSpace: 'pre-line' }}
                            >
                              {message.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Trả lời"
                      value={replyText}
                      onChange={handleReplyChange}
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ReplyIcon />}
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                      >
                        Gửi trả lời
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Danh mục"
                    >
                      <MenuItem value="GENERAL">Chung</MenuItem>
                      <MenuItem value="PRODUCT">Sản phẩm</MenuItem>
                      <MenuItem value="ORDER">Đơn hàng</MenuItem>
                      <MenuItem value="PAYMENT">Thanh toán</MenuItem>
                      <MenuItem value="SHIPPING">Vận chuyển</MenuItem>
                      <MenuItem value="RETURN">Đổi trả</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Độ ưu tiên</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      label="Độ ưu tiên"
                    >
                      <MenuItem value="HIGH">Cao</MenuItem>
                      <MenuItem value="NORMAL">Thường</MenuItem>
                      <MenuItem value="LOW">Thấp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Người được gán"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Để trống nếu chưa gán"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {selectedTicket ? 'Đóng' : 'Hủy'}
          </Button>
          {!selectedTicket && (
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Tạo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportManage; 