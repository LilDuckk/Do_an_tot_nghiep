import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const RevenueReport = () => {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueByCategory: [],
    revenueByStore: [],
    dailyRevenue: [],
    monthlyRevenue: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [reportType, setReportType] = useState('daily');

  const fetchReportData = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reports/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&type=${reportType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  }, [dateRange, reportType]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Báo cáo doanh thu
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Từ ngày"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            select
            label="Loại báo cáo"
            value={reportType}
            onChange={handleReportTypeChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="daily">Theo ngày</MenuItem>
            <MenuItem value="monthly">Theo tháng</MenuItem>
            <MenuItem value="yearly">Theo năm</MenuItem>
          </TextField>
          <Button variant="contained" color="primary" onClick={fetchReportData}>
            Cập nhật
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Tổng quan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng doanh thu
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(reportData.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng đơn hàng
              </Typography>
              <Typography variant="h4" color="primary">
                {reportData.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Giá trị đơn trung bình
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(reportData.averageOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Biểu đồ doanh thu theo thời gian */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo thời gian
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportType === 'daily' ? reportData.dailyRevenue : reportData.monthlyRevenue}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Biểu đồ doanh thu theo danh mục */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo danh mục
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.revenueByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {reportData.revenueByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Biểu đồ doanh thu theo cửa hàng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo cửa hàng
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.revenueByStore}
                    dataKey="revenue"
                    nameKey="store"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {reportData.revenueByStore.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Bảng sản phẩm bán chạy */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm bán chạy
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Số lượng bán</TableCell>
                    <TableCell align="right">Doanh thu</TableCell>
                    <TableCell align="right">% Doanh thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell align="right">
                        {((product.revenue / reportData.totalRevenue) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RevenueReport; 