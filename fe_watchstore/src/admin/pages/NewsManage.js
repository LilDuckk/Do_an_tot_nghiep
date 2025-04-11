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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

const NewsManage = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    category: 'NEWS',
    status: 'DRAFT',
    publishDate: new Date(),
  });
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setNews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (news = null) => {
    if (news) {
      setSelectedNews(news);
      setFormData({
        title: news.title,
        content: news.content,
        summary: news.summary,
        imageUrl: news.imageUrl,
        category: news.category,
        status: news.status,
        publishDate: new Date(news.publishDate),
      });
    } else {
      setSelectedNews(null);
      setFormData({
        title: '',
        content: '',
        summary: '',
        imageUrl: '',
        category: 'NEWS',
        status: 'DRAFT',
        publishDate: new Date(),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNews(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      publishDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedNews
        ? `http://localhost:8080/api/admin/news/${selectedNews.id}`
        : 'http://localhost:8080/api/admin/news';
      const method = selectedNews ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchNews();
        handleCloseDialog();
      } else {
        console.error('Error saving news');
      }
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/news/${newsId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'PUBLISHED':
        return 'success';
      case 'ARCHIVED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'Nháp';
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'ARCHIVED':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'NEWS':
        return 'Tin tức';
      case 'EVENT':
        return 'Sự kiện';
      case 'PROMOTION':
        return 'Khuyến mãi';
      case 'GUIDE':
        return 'Hướng dẫn';
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý tin tức
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm tin tức
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Ngày xuất bản</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{getCategoryText(item.category)}</TableCell>
                    <TableCell>{formatDate(item.publishDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteNews(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {news.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có tin tức nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={news.length}
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
          {selectedNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tóm tắt"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nội dung"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL hình ảnh"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.imageUrl && (
                          <Box
                            component="img"
                            src={formData.imageUrl}
                            alt="Preview"
                            sx={{ height: 40, width: 40, objectFit: 'cover' }}
                          />
                        )}
                      </InputAdornment>
                    ),
                  }}
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
                    <MenuItem value="NEWS">Tin tức</MenuItem>
                    <MenuItem value="EVENT">Sự kiện</MenuItem>
                    <MenuItem value="PROMOTION">Khuyến mãi</MenuItem>
                    <MenuItem value="GUIDE">Hướng dẫn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Trạng thái"
                  >
                    <MenuItem value="DRAFT">Nháp</MenuItem>
                    <MenuItem value="PUBLISHED">Xuất bản</MenuItem>
                    <MenuItem value="ARCHIVED">Lưu trữ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={vi}
                >
                  <DatePicker
                    label="Ngày xuất bản"
                    value={formData.publishDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedNews ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewsManage; 