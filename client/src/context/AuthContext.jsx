/* AuthContext – manages staff authentication state */
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spiceroute_token');
    const userData = localStorage.getItem('spiceroute_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('spiceroute_token', data.token);
      localStorage.setItem('spiceroute_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
    throw new Error('Login failed');
  };

  const logout = () => {
    localStorage.removeItem('spiceroute_token');
    localStorage.removeItem('spiceroute_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
