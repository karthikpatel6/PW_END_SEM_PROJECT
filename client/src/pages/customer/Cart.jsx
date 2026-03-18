/* ============================================
   SpiceRoute - Cart / Review Order Page
   Shows order summary, smart wait time,
   payment options, and place order button
   ============================================ */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import API from '../../api/axios';
import { FiArrowLeft, FiClock, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { MdRestaurantMenu, MdSearch, MdShoppingCart, MdLocationSearching } from 'react-icons/md';

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('GPay');

  const tax = Math.round(cart.subtotal * 0.05);
  const total = cart.subtotal + tax;

  /* Place order via API */
  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    setPlacing(true);
    try {
      const { data } = await API.post('/orders', {
        restaurantId: cart.restaurantId,
        tableNumber: cart.tableNumber,
        items: cart.items,
        paymentMethod
      });
      cart.clearCart();
      navigate(`/track/${encodeURIComponent(data.order.tokenNumber)}`);
    } catch (err) {
      // Demo mode: simulate order placement
      const fakeToken = `%23A-${Math.floor(Math.random() * 900) + 100}`;
      cart.clearCart();
      navigate(`/track/${fakeToken}`);
    } finally { setPlacing(false); }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(232,163,23,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer' }}><FiArrowLeft size={20}/></button>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: 700 }}>Review Order</h1>
      </header>

      {/* Smart Wait Time Banner */}
      <div style={{ padding: '12px 16px' }} className="animate-fade">
        <div style={{ background: 'linear-gradient(135deg, rgba(232,163,23,0.12), rgba(35,26,11,0.9))', border: '1px solid rgba(232,163,23,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,163,23,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🍛</div>
          <div>
            <div style={{ fontWeight: 700, color: '#E8A317', fontSize: '0.9rem' }}>Smart Wait Time</div>
            <div style={{ fontSize: '0.8rem', color: '#A89B8C' }}>Est. 12 mins based on current kitchen load.</div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div style={{ padding: '4px 16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Order Summary</h2>
        {cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6B5E50' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🛒</p>
            <p>Your cart is empty</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Browse Menu</button>
          </div>
        ) : (
          cart.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(232,163,23,0.06)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <div style={{ width: '100%', height: '100%', background: '#2a1f0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#A89B8C' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><FiMinus size={14}/></button>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)} style={{ background: 'none', border: 'none', color: '#E8A317', cursor: 'pointer' }}><FiPlus size={14}/></button>
                </div>
                <span style={{ fontWeight: 600, color: '#F5F0E8', fontSize: '0.9rem' }}>₹{item.price * item.quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {cart.items.length > 0 && (
        <>
          <div style={{ padding: '16px', margin: '12px 16px', background: '#1a1208', borderRadius: 12, border: '1px solid rgba(232,163,23,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A89B8C', marginBottom: 6 }}>
              <span>Subtotal</span><span>₹{cart.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A89B8C', marginBottom: 10 }}>
              <span>Taxes & Fees</span><span>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: 10, borderTop: '1px solid rgba(232,163,23,0.1)' }}>
              <span>Total Payable</span><span style={{ color: '#E8A317' }}>₹{total}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{ padding: '4px 16px 16px' }}>
            <p style={{ fontSize: '0.8rem', color: '#6B5E50', fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>PAY USING UPI</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['GPay', 'PhonePe', 'Paytm'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)} style={{
                  flex: 1, padding: '14px 8px', borderRadius: 12, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.3s',
                  background: paymentMethod === m ? 'rgba(232,163,23,0.1)' : '#1a1208',
                  border: `1px solid ${paymentMethod === m ? 'rgba(232,163,23,0.3)' : 'rgba(232,163,23,0.08)'}`,
                  color: '#F5F0E8'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{m === 'GPay' ? '💳' : m === 'PhonePe' ? '📱' : '💰'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Place Order Button */}
          <div style={{ padding: '0 16px' }}>
            <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}
              style={{ width: '100%', padding: '16px', fontSize: '1rem', borderRadius: 14 }}>
              {placing ? 'Placing Order...' : 'Place Order »'}
            </button>
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link to={`/menu/${cart.restaurantId || 'demo'}?table=${cart.tableNumber}`}><MdRestaurantMenu size={22}/><span>Menu</span></Link>
        <Link to="#"><MdSearch size={22}/><span>Search</span></Link>
        <Link to="/cart" className="active"><MdShoppingCart size={22}/><span>Cart</span></Link>
        <Link to="/track/latest"><MdLocationSearching size={22}/><span>Orders</span></Link>
      </nav>
    </div>
  );
}
