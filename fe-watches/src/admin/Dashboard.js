import React from 'react';
import './static/AdminLayout.css';
import './static/Admin.css';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const fakeStats = {
  today: 12000000,
  week: 65000000,
  month: 280000000,
  total: 3200000000,
};

const fakeStores = [
  { name: 'Store 1', revenue: 120000000 },
  { name: 'Store 2', revenue: 95000000 },
  { name: 'Store 3', revenue: 80000000 },
  { name: 'Store 4', revenue: 60000000 },
];

const fakeBestSellers = [
  { name: 'Rolex Submariner', sold: 32, revenue: 32000000 },
  { name: 'Omega Seamaster', sold: 28, revenue: 21000000 },
  { name: 'Seiko Presage', sold: 25, revenue: 9000000 },
  { name: 'Casio G-Shock', sold: 22, revenue: 4000000 },
  { name: 'Citizen Eco-Drive', sold: 18, revenue: 7000000 },
];

const fakeRevenueByDay = Array.from({ length: 30 }, (_, i) => 5000000 + Math.floor(Math.random() * 10000000));

export default function Dashboard() {
  // Bar chart data for stores
  const barData = {
    labels: fakeStores.map(s => s.name),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: fakeStores.map(s => s.revenue),
        backgroundColor: '#2186eb',
        borderRadius: 8,
      },
    ],
  };

  // Line chart data for revenue by day
  const lineData = {
    labels: Array.from({ length: 30 }, (_, i) => `Ngày ${i + 1}`),
    datasets: [
      {
        label: 'Doanh thu theo ngày (VNĐ)',
        data: fakeRevenueByDay,
        fill: true,
        borderColor: '#2186eb',
        backgroundColor: 'rgba(33,134,235,0.08)',
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div className="admin-dashboard-container" style={{padding: 24}}>
      <h2 style={{marginBottom: 24}}>Dashboard Admin</h2>
      <div className="dashboard-stats" style={{display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap'}}>
        <div className="dashboard-card" style={{flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24}}>
          <div style={{fontSize: 15, color: '#888'}}>Doanh thu hôm nay</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#2186eb'}}>{fakeStats.today.toLocaleString()} đ</div>
        </div>
        <div className="dashboard-card" style={{flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24}}>
          <div style={{fontSize: 15, color: '#888'}}>Doanh thu tuần này</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#27ae60'}}>{fakeStats.week.toLocaleString()} đ</div>
        </div>
        <div className="dashboard-card" style={{flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24}}>
          <div style={{fontSize: 15, color: '#888'}}>Doanh thu tháng này</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#e67e22'}}>{fakeStats.month.toLocaleString()} đ</div>
        </div>
        <div className="dashboard-card" style={{flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24}}>
          <div style={{fontSize: 15, color: '#888'}}>Tổng doanh thu</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#8e44ad'}}>{fakeStats.total.toLocaleString()} đ</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
        {/* Biểu đồ doanh thu các cửa hàng */}
        <div style={{flex: 2, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24, marginBottom: 32}}>
          <h3 style={{fontSize: 18, marginBottom: 16}}>Doanh thu các cửa hàng</h3>
          <Bar data={barData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' đ' } } }
          }} height={220} />
        </div>
        {/* Bảng đồng hồ bán chạy */}
        <div style={{flex: 1, minWidth: 280, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24, marginBottom: 32}}>
          <h3 style={{fontSize: 18, marginBottom: 16}}>Đồng hồ bán chạy</h3>
          <table className="admin-table" style={{fontSize: 15}}>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {fakeBestSellers.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td style={{textAlign: 'center'}}>{item.sold}</td>
                  <td style={{textAlign: 'right'}}>{item.revenue.toLocaleString()} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biểu đồ doanh thu theo ngày */}
      <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e6ed', padding: 24, marginBottom: 32}}>
        <h3 style={{fontSize: 18, marginBottom: 16}}>Doanh thu theo ngày trong tháng</h3>
        <Line data={lineData} options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' đ' } } }
        }} height={220} />
      </div>
    </div>
  );
} 