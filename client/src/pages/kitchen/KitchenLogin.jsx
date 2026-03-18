/* ============================================
   SpiceRoute - Kitchen Login Page
   Simple login form for kitchen staff
   ============================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdKitchen } from 'react-icons/md';

export default function KitchenLogin() {
  const [email, setEmail] = useState('kitchen@spiceroute.com');
  const [password, setPassword] = useState('kitchen123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'kitchen' || user.role === 'manager') {
        navigate('/kitchen/dashboard');
      }
    } catch {
      setError('Invalid credentials. Try kitchen@spiceroute.com / kitchen123');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="animate-slide">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(232,163,23,0.1)', border: '1px solid rgba(232,163,23,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <MdKitchen size={32} color="#E8A317" />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 800 }}>Kitchen Display</h1>
          <p style={{ color: '#A89B8C', fontSize: '0.9rem', marginTop: 4 }}>Sign in to access the KDS</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem', color: '#EF4444' }}>{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kitchen@spiceroute.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Access Kitchen Display →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#6B5E50' }}>
          Demo: kitchen@spiceroute.com / kitchen123
        </p>
      </div>
    </div>
  );
}
