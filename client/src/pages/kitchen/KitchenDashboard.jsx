/* ============================================
   SpiceRoute - Kitchen Display System (KDS)
   Large order cards with color-coded status,
   fire/plated buttons, timers, and tab filters
   matching the dark KDS design screenshots
   ============================================ */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { FiSearch, FiBell, FiSettings, FiUser, FiClock, FiPrinter } from 'react-icons/fi';
import { MdRestaurantMenu, MdPause } from 'react-icons/md';

export default function KitchenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, inPrep: 0, late: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch kitchen orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const restaurantId = user?.restaurant;
        if (!restaurantId) { setDemoOrders(); return; }
        const { data } = await API.get(`/orders/kitchen/${restaurantId}`);
        setOrders(data.orders); setStats(data.stats);
      } catch { setDemoOrders(); }
      finally { setLoading(false); }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const setDemoOrders = () => {
    setOrders([
      { _id: '1', tokenNumber: '#T-101', tableNumber: 3, orderType: 'Dine-In', status: 'placed', minutesAgo: 2, priority: 'normal', items: [{ name: 'Masala Dosa', quantity: 2, station: 'Grill' }, { name: 'Idli (2 pcs)', quantity: 1, station: 'Fryer' }, { name: 'Filter Coffee', quantity: 1, station: 'Cold' }] },
      { _id: '2', tokenNumber: '#T-102', tableNumber: 7, orderType: 'Dine-In', status: 'preparing', minutesAgo: 12, priority: 'priority', items: [{ name: 'Rava Idli', quantity: 1, station: 'Prep' }, { name: 'Medu Vada', quantity: 2, station: 'Sauté' }, { name: 'Sambar Vada', quantity: 1, station: 'Oven' }] },
      { _id: '3', tokenNumber: '#T-103', tableNumber: 12, orderType: 'Dine-In', status: 'preparing', minutesAgo: 18, priority: 'rush', isLate: true, items: [{ name: 'Ghee Podi Idli', quantity: 4, station: 'Fryer' }, { name: 'Kesari Bath', quantity: 2, station: 'Grill' }, { name: 'Pongal', quantity: 1 }] },
      { _id: '4', tokenNumber: '#T-104', tableNumber: 5, orderType: 'Takeout', status: 'preparing', minutesAgo: 8, priority: 'normal', items: [{ name: 'Onion Uttapam', quantity: 3, station: 'Prep' }, { name: 'Paper Roast', quantity: 2, station: 'Bar' }] }
    ]);
    setStats({ total: 12, new: 5, inPrep: 7, late: 2 });
  };

  // Update order status
  const updateStatus = async (orderId, status) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch { /* Demo mode */ setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o)); }
  };

  const filteredOrders = activeTab === 'all' ? orders
    : activeTab === 'new' ? orders.filter(o => o.status === 'placed')
    : activeTab === 'inPrep' ? orders.filter(o => o.status === 'preparing')
    : orders.filter(o => o.isLate);

  const clockStr = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const priorityBadge = (p) => p === 'rush' ? { bg: '#EF4444', text: 'RUSH' } : p === 'priority' ? { bg: '#E8A317', text: 'Priority' } : null;
  const statusColor = (s) => s === 'placed' ? '#22C55E' : s === 'preparing' ? '#E8A317' : '#6B5E50';
  const statusLabel = (s, late) => late ? 'LATE' : s === 'placed' ? 'NEW ORDER' : s === 'preparing' ? 'IN PREP' : s.toUpperCase();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* KDS Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(232,163,23,0.12)', background: '#0d0a06' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,163,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdRestaurantMenu size={18} color="#E8A317" />
          </div>
          <div><div style={{ fontWeight: 700, fontSize: '0.95rem' }}>KDS Active Orders</div><div style={{ fontSize: '0.7rem', color: '#6B5E50' }}>STATION 1: MAIN KITCHEN</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#1a1208', border: '1px solid rgba(232,163,23,0.15)', borderRadius: 20, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiClock size={14} color="#E8A317" /><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem', color: '#E8A317' }}>{clockStr}</span>
          </div>
          <FiSearch size={18} color="#A89B8C" style={{ cursor: 'pointer' }} />
          <FiBell size={18} color="#A89B8C" style={{ cursor: 'pointer' }} />
          <FiSettings size={18} color="#A89B8C" style={{ cursor: 'pointer' }} />
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiUser size={18} color="#A89B8C" /></button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(232,163,23,0.06)' }}>
        <div className="tabs">
          {[
            { key: 'all', label: 'All Orders', count: stats.total },
            { key: 'new', label: 'New', count: stats.new },
            { key: 'inPrep', label: 'In Prep', count: stats.inPrep },
            { key: 'late', label: 'Expedite', count: stats.late }
          ].map(tab => (
            <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}<span className="count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards Grid */}
      <div style={{ flex: 1, padding: 24, overflowX: 'auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {filteredOrders.map((order, idx) => {
          const badge = priorityBadge(order.priority);
          return (
            <div key={order._id} className={`order-card ${order.priority === 'rush' ? 'rush' : ''} ${order.priority === 'priority' ? 'priority' : ''} ${order.isLate ? 'late' : ''}`}
              style={{ minWidth: 260, maxWidth: 300, animation: `fadeIn 0.4s ease ${idx * 0.1}s both` }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 800 }}>{order.tokenNumber}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: statusColor(order.status), letterSpacing: 0.5 }}>
                    {statusLabel(order.status, order.isLate)} • {order.minutesAgo}M AGO
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {badge && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: badge.bg + '22', color: badge.bg, border: `1px solid ${badge.bg}44` }}>{badge.text}</span>}
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 500, background: '#1a1208', color: '#A89B8C', border: '1px solid rgba(232,163,23,0.08)' }}>{order.orderType}</span>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(232,163,23,0.05)' : 'none',
                    ...(order.priority === 'rush' ? { background: 'rgba(239,68,68,0.05)', margin: '0 -10px', padding: '8px 10px', borderRadius: 6 } : {}) }}>
                    <span style={{ fontSize: '0.88rem', color: order.priority === 'rush' ? '#f87171' : '#F5F0E8' }}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.station && <span style={{ fontSize: '0.7rem', color: '#6B5E50' }}>{item.station}</span>}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={`btn btn-sm ${order.status === 'placed' ? 'btn-secondary' : ''}`}
                  style={order.status !== 'placed' ? { background: '#333', color: '#888', border: '1px solid #444', cursor: 'default' } : {}}
                  onClick={() => order.status === 'placed' && updateStatus(order._id, 'preparing')}>
                  {order.status === 'placed' ? 'FIRE' : 'FIRED'}
                </button>
                <button className={`btn btn-sm ${order.status === 'preparing' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => order.status === 'preparing' && updateStatus(order._id, 'ready')}>
                  PLATED
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid rgba(232,163,23,0.12)', background: '#0d0a06' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-sm btn-secondary"><FiPrinter size={14}/> Re-print All</button>
          <button className="btn btn-sm btn-secondary"><MdPause size={14}/> Pause Station</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: '0.75rem', color: '#6B5E50' }}>ACTIVE STATION</div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#E8A317' }}>KITCHEN_ALPHA_01</span>
          <button className="btn btn-sm btn-danger" onClick={() => orders.forEach(o => o.status === 'preparing' && updateStatus(o._id, 'ready'))}>
            BUMP ALL COMPLETED
          </button>
        </div>
      </div>
    </div>
  );
}
