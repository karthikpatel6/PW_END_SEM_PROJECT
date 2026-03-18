/* ============================================
   SpiceRoute - Menu Management Page
   Manager can view, toggle availability, and
   manage all menu items from this page
   ============================================ */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { FiGrid, FiMenu, FiBarChart2, FiActivity, FiLogOut, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';

export default function MenuManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await API.get('/manager/menu'); setItems(data.menuItems); }
      catch {
        setItems([
          { _id: '1', name: 'Steamed Idli', category: 'Breakfast', price: 30, isAvailable: true, isQuickPrep: true, complexity: 'LOW', prepTime: 5, orderCount: 19 },
          { _id: '2', name: 'Masala Dosa', category: 'Breakfast', price: 60, isAvailable: true, isQuickPrep: false, complexity: 'MEDIUM', prepTime: 10, orderCount: 24 },
          { _id: '3', name: 'Paneer Butter Masala', category: 'Main Course', price: 160, isAvailable: true, isQuickPrep: false, complexity: 'MEDIUM', prepTime: 15, orderCount: 8 },
          { _id: '4', name: 'Maharaja Special Thali', category: 'Specials', price: 180, isAvailable: false, isQuickPrep: false, complexity: 'HIGH', prepTime: 30, orderCount: 5 },
          { _id: '5', name: 'Filter Coffee', category: 'Beverages', price: 20, isAvailable: true, isQuickPrep: true, complexity: 'LOW', prepTime: 3, orderCount: 38 },
          { _id: '6', name: 'Butter Chicken', category: 'Main Course', price: 200, isAvailable: true, isQuickPrep: false, complexity: 'HIGH', prepTime: 20, orderCount: 15 }
        ]);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const toggleAvailability = async (id) => {
    try { await API.patch(`/menu/${id}/toggle`); } catch {}
    setItems(prev => prev.map(i => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i));
  };

  const categories = ['All', ...new Set(items.map(i => i.category))];
  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

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
          { icon: <FiMenu />, label: 'Menu Management', path: '/manager/menu', active: true },
          { icon: <FiBarChart2 />, label: 'Analytics', path: '/manager/analytics' },
          { icon: <FiActivity />, label: 'Kitchen View', path: '/kitchen/dashboard' }
        ].map(item => (
          <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 4, color: item.active ? '#E8A317' : '#A89B8C', background: item.active ? 'rgba(232,163,23,0.08)' : 'transparent', fontSize: '0.9rem', fontWeight: item.active ? 600 : 400, textDecoration: 'none' }}>{item.icon} {item.label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none', color: '#6B5E50', cursor: 'pointer', fontSize: '0.9rem' }}><FiLogOut /> Logout</button>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800 }}>Menu Management</h1>
          <button className="btn btn-primary btn-sm"><FiPlus /> Add Item</button>
        </div>

        {/* Category Filter */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {categories.map(cat => (
            <button key={cat} className={`tab ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>

        {/* Menu Items Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Prep Time</th><th>Complexity</th><th>Orders</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 600 }}>{item.name}</span>{item.isQuickPrep && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>QP</span>}</div></td>
                  <td style={{ color: '#A89B8C' }}>{item.category}</td>
                  <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                  <td style={{ color: '#A89B8C' }}>{item.prepTime}m</td>
                  <td><span className={`badge ${item.complexity === 'LOW' ? 'badge-green' : item.complexity === 'MEDIUM' ? 'badge-yellow' : 'badge-red'}`}>{item.complexity}</span></td>
                  <td><span className="badge badge-amber">{item.orderCount}</span></td>
                  <td>
                    <label className="toggle"><input type="checkbox" checked={item.isAvailable} onChange={() => toggleAvailability(item._id)} /><span className="toggle-slider" /></label>
                  </td>
                  <td><div style={{ display: 'flex', gap: 8 }}><button style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><FiEdit size={15} /></button><button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><FiTrash2 size={15} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
