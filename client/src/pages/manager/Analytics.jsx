/* ============================================
   SpiceRoute - Analytics Page
   Charts and graphs for order volume,
   revenue, workload metrics, and performance
   ============================================ */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FiGrid, FiMenu, FiBarChart2, FiActivity, FiLogOut, FiTrendingUp } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';

export default function Analytics() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await API.get(`/manager/analytics?period=${period}`); setAnalytics(data.analytics); }
      catch {
        setAnalytics({
          ordersByHour: { 9: 3, 10: 5, 11: 8, 12: 14, 13: 12, 14: 7, 15: 4, 16: 5, 17: 6, 18: 10, 19: 15, 20: 13, 21: 9, 22: 4 },
          categorySales: { Breakfast: 4200, 'Main Course': 5600, Beverages: 1800, Specials: 2400, Starters: 1900, Desserts: 800 },
          summary: { totalOrders: 47, totalRevenue: 12450, avgOrdersPerHour: 3.9, peakHour: '12' }
        });
      } finally { setLoading(false); }
    };
    fetch();
  }, [period]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const hourData = Object.entries(analytics.ordersByHour).map(([h, v]) => ({ hour: `${h}:00`, orders: v }));
  const catData = Object.entries(analytics.categorySales).map(([name, value]) => ({ name, value }));
  const COLORS = ['#E8A317', '#F5C042', '#C4880E', '#22C55E', '#3B82F6', '#8B5CF6'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0d0a06', borderRight: '1px solid rgba(232,163,23,0.1)', padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,163,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdRestaurantMenu size={20} color="#E8A317" /></div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem' }}>SPICE<span style={{ color: '#E8A317' }}>ROUTE</span></span>
        </div>
        {[
          { icon: <FiGrid />, label: 'Dashboard', path: '/manager/dashboard' },
          { icon: <FiMenu />, label: 'Menu Management', path: '/manager/menu' },
          { icon: <FiBarChart2 />, label: 'Analytics', path: '/manager/analytics', active: true },
          { icon: <FiActivity />, label: 'Kitchen View', path: '/kitchen/dashboard' }
        ].map(item => (
          <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 4, color: item.active ? '#E8A317' : '#A89B8C', background: item.active ? 'rgba(232,163,23,0.08)' : 'transparent', fontSize: '0.9rem', fontWeight: item.active ? 600 : 400, textDecoration: 'none' }}>{item.icon} {item.label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none', color: '#6B5E50', cursor: 'pointer', fontSize: '0.9rem' }}><FiLogOut /> Logout</button>
      </aside>
 
      {/* Content */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800 }}>Analytics</h1>
          <div className="tabs">
            {['today', 'week', 'month'].map(p => (
              <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Orders', value: analytics.summary.totalOrders, icon: '📋' },
            { label: 'Total Revenue', value: `₹${analytics.summary.totalRevenue.toLocaleString()}`, icon: '💰' },
            { label: 'Avg Orders/Hr', value: analytics.summary.avgOrdersPerHour, icon: '📈' },
            { label: 'Peak Hour', value: `${analytics.summary.peakHour}:00`, icon: '🔥' }
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#E8A317' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B5E50', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Orders by Hour */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiTrendingUp size={16} color="#E8A317" /> Orders by Hour</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,163,23,0.08)" />
                <XAxis dataKey="hour" stroke="#6B5E50" fontSize={11} />
                <YAxis stroke="#6B5E50" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a1208', border: '1px solid rgba(232,163,23,0.2)', borderRadius: 8, color: '#F5F0E8' }} />
                <Bar dataKey="orders" fill="#E8A317" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Category */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1208', border: '1px solid rgba(232,163,23,0.2)', borderRadius: 8, color: '#F5F0E8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}