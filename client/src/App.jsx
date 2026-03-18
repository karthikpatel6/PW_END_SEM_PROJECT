/* SpiceRoute App – Main Router */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Landing from './pages/Landing';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import OrderTracking from './pages/customer/OrderTracking';
import KitchenLogin from './pages/kitchen/KitchenLogin';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import ManagerLogin from './pages/manager/ManagerLogin';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import MenuManagement from './pages/manager/MenuManagement';
import Analytics from './pages/manager/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track/:tokenNumber" element={<OrderTracking />} />
            <Route path="/kitchen/login" element={<KitchenLogin />} />
            <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
            <Route path="/manager/login" element={<ManagerLogin />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/menu" element={<MenuManagement />} />
            <Route path="/manager/analytics" element={<Analytics />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
