/* ============================================
   SpiceRoute - Order Tracking Page
   Live order status with kitchen pulse,
   progress bar, token number, and timeline
   ============================================ */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { FiArrowLeft, FiMoreVertical, FiCheckCircle, FiClock } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';

export default function OrderTracking() {
  const { tokenNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/track/${encodeURIComponent(tokenNumber)}`);
        setOrder(data.order);
      } catch {
        // Demo order
        setOrder({
          tokenNumber: decodeURIComponent(tokenNumber),
          status: 'preparing', kitchenProgress: 65,
          kitchenNote: 'Chef is currently garnishing your order',
          estimatedWaitTime: 15,
          placedAt: new Date(Date.now() - 8 * 60000).toISOString(),
          items: [
            { name: 'Steamed Idli', price: 30, quantity: 1 },
            { name: 'Medhu Vada (2 pcs)', price: 40, quantity: 1 }
          ],
          subtotal: 70, tax: 4, total: 74
        });
      } finally { setLoading(false); }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [tokenNumber]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statusLabel = { placed: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing your meal', ready: 'Ready for Pickup!', served: 'Served' };
  const estTime = order?.placedAt ? new Date(new Date(order.placedAt).getTime() + (order.estimatedWaitTime || 15) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:45 PM';
  const statusBadge = order?.status === 'ready' ? 'READY' : order?.status === 'preparing' ? 'PREPARING' : 'PLACED';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 30 }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(232,163,23,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer' }}><FiArrowLeft size={20}/></button>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 700 }}>Track Your Order</h1>
        <FiMoreVertical size={20} color="#A89B8C" />
      </header>

      {/* Status Hero */}
      <div className="animate-slide" style={{ textAlign: 'center', padding: '30px 16px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🍛</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>
          {statusLabel[order?.status] || 'Preparing your meal'}
        </h2>
        <p style={{ color: '#A89B8C', fontSize: '0.85rem' }}>Estimated arrival at {estTime}</p>
      </div>

      {/* Token Number */}
      <div style={{ padding: '0 16px', marginBottom: 16 }} className="animate-fade">
        <div style={{ background: 'linear-gradient(135deg, rgba(232,163,23,0.12), rgba(232,163,23,0.04))', border: '1px solid rgba(232,163,23,0.2)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#E8A317', letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>ORDER TOKEN NUMBER</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#E8A317' }}>{order?.tokenNumber || '#A-582'}</div>
        </div>
      </div>

      {/* Kitchen Pulse */}
      <div style={{ padding: '0 16px', marginBottom: 16 }} className="animate-fade">
        <div style={{ background: '#1a1208', border: '1px solid rgba(232,163,23,0.12)', borderRadius: 14, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8A317', animation: 'pulse 2s infinite' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Kitchen Pulse</span>
            </div>
            <span className="badge badge-amber">{statusBadge}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#A89B8C' }}>Kitchen Progress</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#E8A317' }}>{order?.kitchenProgress || 65}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${order?.kitchenProgress || 65}%` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.78rem', color: '#6B5E50' }}>
            <FiClock size={12} /> {order?.kitchenNote || 'Chef is currently garnishing your order'}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div style={{ padding: '0 16px 16px' }} className="animate-fade">
        {[
          { label: 'Order Confirmed', time: new Date(order?.placedAt || Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), done: true },
          { label: 'Preparing in Kitchen', sub: order?.status === 'preparing' ? 'In Progress' : order?.status === 'ready' ? 'Done' : 'Pending', done: ['preparing','ready','served'].includes(order?.status) },
          { label: 'Out for Delivery', sub: 'Pending', done: order?.status === 'served' }
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20, position: 'relative' }}>
            {i < 2 && <div style={{ position: 'absolute', left: 11, top: 28, width: 2, height: 'calc(100% - 28px)', background: step.done ? 'rgba(232,163,23,0.3)' : 'rgba(232,163,23,0.08)' }} />}
            <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: step.done ? 'rgba(34,197,94,0.15)' : '#1a1208', border: `2px solid ${step.done ? '#22C55E' : '#333'}` }}>
              {step.done && <FiCheckCircle size={12} color="#22C55E" />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: step.done ? '#22C55E' : '#F5F0E8' }}>{step.label}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B5E50' }}>{step.time || step.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div style={{ padding: '0 16px', margin: '0 0 20px' }}>
        <div style={{ background: '#1a1208', border: '1px solid rgba(232,163,23,0.08)', borderRadius: 14, padding: 16 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>Order Summary</h3>
          {order?.items?.map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
              <span style={{ color: '#A89B8C' }}>{it.quantity}x {it.name}</span>
              <span>₹{(it.price * it.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(232,163,23,0.08)', fontWeight: 700, color: '#22C55E' }}>
            <span>Total Amount</span><span>₹{order?.total?.toFixed(2) || '74.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
