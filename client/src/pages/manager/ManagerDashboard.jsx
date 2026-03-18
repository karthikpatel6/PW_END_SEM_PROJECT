/* ============================================
   SpiceRoute - Manager Dashboard
   Workload gauge, active orders, revenue,
   staff suggestions, and quick actions
   ============================================ */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { FiActivity, FiUsers, FiDollarSign, FiClock, FiMenu, FiBarChart2, FiGrid, FiLogOut } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/manager/dashboard');
        setDashboard(data.dashboard);
      } catch {
        setDashboard({
          workload: { loadPercentage: 65, loadLevel: 'moderate', activeOrders: 8, kitchenCapacity: 15 },
          staffRecommendation: { onDutyStaff: 2, recommendedStaff: 3, needMoreStaff: true, message: '⚠️ Recommended 3 staff. Currently 2 on duty.' },
          menuFilter: { isFiltering: false, lockedCount: 0, message: '' },
          todayStats: { totalOrders: 47, completedOrders: 39, activeOrders: 8, totalRevenue: 12450, avgPrepTime: 14 },
          activeOrders: [],
          topItems: [
            { name: 'Masala Dosa', orderCount: 24, price: 60 },
            { name: 'Filter Coffee', orderCount: 38, price: 20 },
            { name: 'Steamed Idli', orderCount: 19, price: 30 },
            { name: 'Butter Chicken', orderCount: 15, price: 200 },
            { name: 'Paneer Tikka', orderCount: 12, price: 120 }
          ]
        });
      } finally { setLoading(false); }
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  const d = dashboard;
  const loadColor = d.workload.loadLevel === 'low' ? '#22C55E' : d.workload.loadLevel === 'moderate' ? '#E8A317' : '#EF4444';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Sidebar + Content */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ width: 240, background: '#0d0a06', borderRight: '1px solid rgba(232,163,23,0.1)', padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,163,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdRestaurantMenu size={20} color="#E8A317" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem' }}>SPICE<span style={{ color: '#E8A317' }}>ROUTE</span></span>
          </div>
          {[
            { icon: <FiGrid />, label: 'Dashboard', path: '/manager/dashboard', active: true },
            { icon: <FiMenu />, label: 'Menu Management', path: '/manager/menu' },
            { icon: <FiBarChart2 />, label: 'Analytics', path: '/manager/analytics' },
            { icon: <FiActivity />, label: 'Kitchen View', path: '/kitchen/dashboard' }
          ].map(item => (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 4, color: item.active ? '#E8A317' : '#A89B8C', background: item.active ? 'rgba(232,163,23,0.08)' : 'transparent', fontSize: '0.9rem', fontWeight: item.active ? 600 : 400, textDecoration: 'none' }}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none', color: '#6B5E50', cursor: 'pointer', fontSize: '0.9rem' }}>
            <FiLogOut /> Logout
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: '#6B5E50', fontSize: '0.85rem' }}>Welcome back, {user?.name || 'Manager'}</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { icon: <FiActivity size={20} />, label: 'Kitchen Load', value: `${d.workload.loadPercentage}%`, color: loadColor, sub: d.workload.loadLevel.toUpperCase() },
              { icon: <FiClock size={20} />, label: 'Active Orders', value: d.todayStats.activeOrders, color: '#E8A317', sub: `of ${d.todayStats.totalOrders} today` },
              { icon: <FiDollarSign size={20} />, label: "Today's Revenue", value: `₹${d.todayStats.totalRevenue.toLocaleString()}`, color: '#22C55E', sub: `${d.todayStats.completedOrders} completed` },
              { icon: <FiUsers size={20} />, label: 'Staff on Duty', value: d.staffRecommendation.onDutyStaff, color: d.staffRecommendation.needMoreStaff ? '#EF4444' : '#22C55E', sub: `Need ${d.staffRecommendation.recommendedStaff}` }
            ].map((stat, i) => (
              <div key={i} className="card animate-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#6B5E50', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</span>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B5E50', marginTop: 4 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Workload Gauge + Staff Recommendation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Kitchen Workload</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', border: `6px solid ${loadColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: `0 0 30px ${loadColor}22` }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: loadColor }}>{d.workload.loadPercentage}%</span>
                  <span style={{ fontSize: '0.7rem', color: '#6B5E50' }}>LOAD</span>
                </div>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${d.workload.loadPercentage}%` }} /></div>
              <p style={{ fontSize: '0.8rem', color: '#A89B8C', marginTop: 8, textAlign: 'center' }}>
                {d.workload.activeOrders} active / {d.workload.kitchenCapacity} capacity
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Staff Recommendation</h3>
              <div style={{ background: d.staffRecommendation.needMoreStaff ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${d.staffRecommendation.needMoreStaff ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: '0.85rem' }}>
                {d.staffRecommendation.message}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#A89B8C' }}>
                <p style={{ marginBottom: 8 }}>Avg. Prep Time: <strong style={{ color: '#F5F0E8' }}>{d.todayStats.avgPrepTime} min</strong></p>
                <p>Menu Filtering: <strong style={{ color: d.menuFilter.isFiltering ? '#EF4444' : '#22C55E' }}>{d.menuFilter.isFiltering ? `Active (${d.menuFilter.lockedCount} items locked)` : 'Inactive'}</strong></p>
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Top Selling Items</h3>
            <table className="data-table">
              <thead><tr><th>Item</th><th>Orders</th><th>Price</th></tr></thead>
              <tbody>
                {d.topItems.map((item, i) => (
                  <tr key={i}><td style={{ fontWeight: 500 }}>{item.name}</td><td><span className="badge badge-amber">{item.orderCount}</span></td><td>₹{item.price}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
