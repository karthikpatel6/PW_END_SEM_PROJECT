/* CartContext – manages customer shopping cart state */
import { createContext, useContext, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [tableNumber, setTableNumber] = useState(1);

  const addItem = (menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menuItemId: menuItem._id, name: menuItem.name,
        price: menuItem.price, image: menuItem.image, quantity: 1, notes: ''
      }];
    });
  };

  const removeItem = (menuItemId) => setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) return removeItem(menuItemId);
    setItems(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, restaurantId, tableNumber, subtotal, itemCount,
      addItem, removeItem, updateQuantity, clearCart, setRestaurantId, setTableNumber
    }}>
      {children}
    </CartContext.Provider>
  );
}
