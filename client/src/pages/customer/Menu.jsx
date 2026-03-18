/* ============================================
   SpiceRoute - Customer Menu Page
   Shows restaurant menu with:
   - Live Kitchen Pulse (workload indicator)
   - Category filter tabs
   - Smart badges (QUICK PREP, HIGH WAIT, LOCKED)
   - Add to cart functionality
   ============================================ */
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import API from '../../api/axios';
import { MdRestaurantMenu, MdSearch, MdShoppingCart, MdLocationSearching } from 'react-icons/md';
import { FiPlus, FiMinus, FiClock } from 'react-icons/fi';

export default function Menu() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cart = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [workload, setWorkload] = useState({});
  const [waitTime, setWaitTime] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const table = searchParams.get('table') || 1;

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await API.get(`/menu/${restaurantId}`, {
          params: { category: activeCategory !== 'All Items' ? activeCategory : undefined }
        });
        setMenuItems(data.menuItems);
        setRestaurant(data.restaurant);
        setWorkload(data.workload);
        setWaitTime(data.waitTime);
        setCategories(data.categories);
        cart.setRestaurantId(restaurantId);
        cart.setTableNumber(parseInt(table));
      } catch (err) {
        // Use demo data if API unavailable
        setRestaurant({ name: 'Royal Indian Cuisine', currency: '₹' });
        setWorkload({ loadLevel: 'moderate', loadPercentage: 65, activeOrders: 8 });
        setWaitTime({ range: '12-18', loadLevel: 'moderate' });
        setCategories(['All Items', 'Quick Prep', 'Breakfast', 'Main Course', 'Beverages', 'Desserts']);
        setMenuItems(getDemoItems());
      } finally { setLoading(false); }
    };
    fetchMenu();
    const interval = setInterval(fetchMenu, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [restaurantId, activeCategory]);

  // Get load color based on level
  const getLoadColor = (level) => {
    switch(level) {
      case 'low': return '#22C55E';
      case 'moderate': return '#E8A317';
      case 'high': return '#f97316';
      case 'critical': return '#EF4444';
      default: return '#E8A317';
    }
  };

  const getLoadLabel = (level) => {
    switch(level) {
      case 'low': return 'Low Load';
      case 'moderate': return 'Moderate Load';
      case 'high': return 'High Load';
      case 'critical': return 'Very Busy';
      default: return 'Moderate Load';
    }
  };

  const filteredItems = searchQuery
    ? menuItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : menuItems;

  const cartItem = (id) => cart.items.find(i => i.menuItemId === id);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p className="text-muted">Loading menu...</p></div>;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.menuBtn}>☰</button>
        <h1 style={styles.headerTitle}>{restaurant?.name || 'Restaurant'}</h1>
        <button style={styles.menuBtn}>👤</button>
      </header>

      {/* Kitchen Pulse Card */}
      <div style={{ padding: '0 16px', marginTop: 8 }} className="animate-fade">
        <div style={{ ...styles.pulseCard, borderColor: getLoadColor(workload.loadLevel) + '33' }}>
          <div style={styles.pulseHeader}>
            <div>
              <div style={{ fontSize: '0.7rem', color: getLoadColor(workload.loadLevel), fontWeight: 700, letterSpacing: 1 }}>
                LIVE KITCHEN PULSE
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>{getLoadLabel(workload.loadLevel)}</div>
            </div>
            <div style={{ ...styles.loadCircle, borderColor: getLoadColor(workload.loadLevel) }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{workload.loadPercentage || 65}%</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${workload.loadPercentage || 65}%`, background: `linear-gradient(90deg, ${getLoadColor(workload.loadLevel)}88, ${getLoadColor(workload.loadLevel)})` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#A89B8C', fontSize: '0.8rem' }}>
            <FiClock size={13} /> Estimated prep: {waitTime.range || '12-18'} mins
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div className="tabs">
          {categories.map(cat => (
            <button key={cat} className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div style={{ padding: '8px 16px 4px' }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 700 }}>
          Today's Selection
        </h2>
      </div>

      {/* Menu Items List */}
      <div style={{ padding: '8px 16px' }}>
        {filteredItems.map((item, idx) => (
          <div key={item._id || idx} className="animate-fade" style={{ ...styles.menuItem, animationDelay: `${idx * 0.05}s` }}>
            <div style={styles.menuItemImage}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#2a1f0e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
              )}
              {item.isBestseller && <div style={styles.busyBadge}>⭐ BEST</div>}
            </div>

            <div style={styles.menuItemInfo}>
              <div style={styles.menuItemTop}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 2 }}>{item.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#A89B8C', lineHeight: 1.4 }}>{item.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {item.isQuickPrep && <span className="badge badge-green">QUICK PREP</span>}
                  {item.badge === 'HIGH WAIT' && <span className="badge badge-red">HIGH WAIT</span>}
                  {item.prepTimeLabel && <span style={{ fontSize: '0.7rem', color: '#6B5E50' }}>{item.prepTimeLabel}</span>}
                </div>
              </div>

              <div style={styles.menuItemBottom}>
                <span style={{ color: '#E8A317', fontWeight: 700, fontSize: '0.95rem' }}>
                  {restaurant?.currency || '₹'}{item.price}
                </span>

                {item.isLocked ? (
                  <button className="btn btn-sm" disabled style={{ opacity: 0.5, background: '#333', color: '#888' }}>LOCKED</button>
                ) : cartItem(item._id) ? (
                  <div style={styles.qtyControl}>
                    <button onClick={() => cart.updateQuantity(item._id, cartItem(item._id).quantity - 1)} style={styles.qtyBtn}><FiMinus /></button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{cartItem(item._id).quantity}</span>
                    <button onClick={() => cart.updateQuantity(item._id, cartItem(item._id).quantity + 1)} style={styles.qtyBtn}><FiPlus /></button>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-primary" onClick={() => cart.addItem(item)}>ADD +</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link to={`/menu/${restaurantId}?table=${table}`} className="active">
          <MdRestaurantMenu size={22} /><span>MENU</span>
        </Link>
        <Link to={`/menu/${restaurantId}?table=${table}`}>
          <MdSearch size={22} /><span>Search</span>
        </Link>
        <Link to="/cart" style={{ position: 'relative' }}>
          <MdShoppingCart size={22} />
          {cart.itemCount > 0 && <span style={styles.cartBadge}>{cart.itemCount}</span>}
          <span>Cart</span>
        </Link>
        <Link to="/track/latest">
          <MdLocationSearching size={22} /><span>Orders</span>
        </Link>
      </nav>
    </div>
  );
}

/* Demo items when API unavailable */
function getDemoItems() {
  return [
    { _id: '1', name: 'Medhu Vada (2 pcs)', description: 'Crispy lentil donuts served with sambar', price: 40, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400', category: 'Breakfast', isQuickPrep: true, isBestseller: true, isVeg: true },
    { _id: '2', name: 'Steamed Idli', description: 'Fluffy rice cakes with coconut chutney', price: 30, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', category: 'Breakfast', isQuickPrep: true, isBestseller: true, isVeg: true },
    { _id: '3', name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato gravy', price: 160, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', category: 'Main Course', prepTimeLabel: '15 min prep', isVeg: true },
    { _id: '4', name: 'Maharaja Special Thali', description: 'Full platter with 12 traditional items', price: 180, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', category: 'Specials', badge: 'HIGH WAIT', isLocked: false, isVeg: true },
    { _id: '5', name: 'Biryani (Chicken)', description: 'Slow-cooked aromatic basmati rice', price: 180, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', category: 'Specials', badge: 'HIGH WAIT', isVeg: false },
    { _id: '6', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee', price: 20, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', category: 'Beverages', isQuickPrep: true, isVeg: true },
  ];
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(232,163,23,0.1)' },
  headerTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700 },
  menuBtn: { background: 'none', border: 'none', color: '#F5F0E8', fontSize: '1.2rem', cursor: 'pointer', padding: 4 },
  pulseCard: { background: 'linear-gradient(135deg, rgba(232,163,23,0.08), rgba(35,26,11,0.9))', border: '1px solid', borderRadius: 16, padding: '14px 18px' },
  pulseHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  loadCircle: { width: 48, height: 48, borderRadius: '50%', border: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menuItem: { display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(232,163,23,0.06)' },
  menuItemImage: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  busyBadge: { position: 'absolute', bottom: 4, left: 4, fontSize: '0.6rem', background: 'rgba(0,0,0,0.7)', color: '#F5C042', padding: '2px 6px', borderRadius: 8, fontWeight: 600 },
  menuItemInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  menuItemTop: { display: 'flex', justifyContent: 'space-between', gap: 8 },
  menuItemBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 8, background: '#2a1f0e', borderRadius: 8, padding: '4px 8px' },
  qtyBtn: { background: 'none', border: 'none', color: '#E8A317', cursor: 'pointer', padding: 2, display: 'flex' },
  cartBadge: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#E8A317', color: '#0d0a06', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }
};
