/* ============================================
   SpiceRoute - Landing Page
   Portal selection: Manager / Kitchen / Customer
   Matches the dark theme design with amber accents
   ============================================ */
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { MdRestaurantMenu, MdKitchen, MdManageAccounts } from 'react-icons/md';

export default function Landing() {
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState('');

  useEffect(() => {
    API.get('/health').then(() => {
      API.get('/menu/default').catch(() => {});
    }).catch(() => {});
  }, []);

  return (
    <div style={styles.page}>
      {/* Background gradient overlay */}
      <div style={styles.bgOverlay} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <MdRestaurantMenu size={24} color="#E8A317" />
          </div>
          <span style={styles.logoText}>SPICE<span style={{ color: '#E8A317' }}>ROUTE</span></span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.left}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            SYSTEM ONLINE
          </div>
          <h1 style={styles.title}>
            The Heart of<br />Your <span style={styles.titleAccent}>Kitchen.</span>
          </h1>
          <p style={styles.subtitle}>
            Select your destination to access the SpiceRoute unified management ecosystem.
          </p>
          <div style={styles.trustBadge}>
            <div style={styles.avatarGroup}>
              {['👨‍🍳', '👩‍🍳', '🧑‍🍳'].map((e, i) => (
                <div key={i} style={{ ...styles.avatar, marginLeft: i > 0 ? '-8px' : 0, zIndex: 3 - i }}>
                  {e}
                </div>
              ))}
            </div>
            <span style={styles.trustText}>Trusted by over 400+ active locations</span>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.portalCard}>
            <h3 style={styles.portalTitle}>
              <span style={{ color: '#E8A317', marginRight: 8 }}>→</span>
              Choose Your Portal
            </h3>

            {/* Manager Access */}
            <button style={styles.portalBtn} onClick={() => navigate('/manager/login')}>
              <div style={styles.portalBtnIcon}><MdManageAccounts size={22} /></div>
              <div style={styles.portalBtnText}>
                <strong>Manager Access</strong>
                <span>Analytics, Staff & Inventory</span>
              </div>
              <FiArrowRight />
            </button>

            {/* Kitchen Display */}
            <button style={styles.portalBtn} onClick={() => navigate('/kitchen/login')}>
              <div style={styles.portalBtnIcon}><MdKitchen size={22} /></div>
              <div style={styles.portalBtnText}>
                <strong>Kitchen Display</strong>
                <span>Active Orders & KDS Interface</span>
              </div>
              <FiArrowRight />
            </button>

            {/* Browse Menu - Needs Restaurant ID */}
            <button style={styles.portalBtn} onClick={() => {
              const id = restaurantId || 'demo';
              navigate(`/menu/${id}?table=1`);
            }}>
              <div style={styles.portalBtnIcon}><MdRestaurantMenu size={22} /></div>
              <div style={styles.portalBtnText}>
                <strong>Browse Menu</strong>
                <span>Digital Menu for Customers</span>
              </div>
              <FiExternalLink />
            </button>

            <p style={styles.biometricNote}>
              🔒 Secure biometric login available on tablet apps
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Privacy Policy</a>
          <span style={styles.footerDot}>•</span>
          <a href="#" style={styles.footerLink}>Terms of Service</a>
          <span style={styles.footerDot}>•</span>
          <a href="#" style={styles.footerLink}>Support</a>
        </div>
        <span style={styles.copyright}>© 2024 SPICEROUTE TECHNOLOGY GROUP</span>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  bgOverlay: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(232,163,23,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,136,14,0.04) 0%, transparent 50%)'
  },
  header: {
    position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '20px 40px',
    borderBottom: '1px solid rgba(232,163,23,0.1)'
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(232,163,23,0.1)', border: '1px solid rgba(232,163,23,0.2)'
  },
  logoText: { fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem', letterSpacing: 2, color: '#F5F0E8' },
  main: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 80, padding: '40px', position: 'relative', zIndex: 10, flexWrap: 'wrap'
  },
  left: { maxWidth: 480 },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
    borderRadius: 20, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)',
    color: '#22C55E', fontSize: '0.75rem', fontWeight: 600, letterSpacing: 1, marginBottom: 24
  },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' },
  title: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, color: '#F5F0E8', marginBottom: 16 },
  titleAccent: { color: '#E8A317', display: 'inline-block' },
  subtitle: { fontSize: '1rem', color: '#A89B8C', lineHeight: 1.6, marginBottom: 32 },
  trustBadge: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarGroup: { display: 'flex' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#2a1f0e', border: '2px solid #1a1208', fontSize: '1.1rem', position: 'relative'
  },
  trustText: { fontSize: '0.85rem', color: '#A89B8C' },
  right: { width: 380 },
  portalCard: {
    background: '#1a1208', border: '1px solid rgba(232,163,23,0.15)',
    borderRadius: 16, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
  },
  portalTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#F5F0E8', marginBottom: 20, display: 'flex', alignItems: 'center' },
  portalBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
    background: 'linear-gradient(135deg, rgba(232,163,23,0.12), rgba(196,136,14,0.08))',
    border: '1px solid rgba(232,163,23,0.2)', borderRadius: 12, cursor: 'pointer',
    color: '#F5F0E8', marginBottom: 10, transition: 'all 0.3s ease'
  },
  portalBtnIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(232,163,23,0.15)', color: '#E8A317'
  },
  portalBtnText: { flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.9rem' },
  biometricNote: { textAlign: 'center', fontSize: '0.78rem', color: '#6B5E50', marginTop: 16 },
  footer: {
    position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 40px', borderTop: '1px solid rgba(232,163,23,0.08)',
    flexWrap: 'wrap', gap: 12
  },
  footerLinks: { display: 'flex', gap: 8, alignItems: 'center' },
  footerLink: { color: '#6B5E50', fontSize: '0.8rem', textDecoration: 'none' },
  footerDot: { color: '#6B5E50', fontSize: '0.6rem' },
  copyright: { color: '#6B5E50', fontSize: '0.75rem', letterSpacing: 0.5 }
};
