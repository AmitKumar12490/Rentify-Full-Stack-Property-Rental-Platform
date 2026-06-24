import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'User') {
        api.get('/wishlist').then(res => setWishlist(res.data.map(p => p._id))).catch(console.error);
      }
    }
    setLoading(false);
  }, []);

  const toggleWishlist = async (propertyId) => {
    try {
      const { data } = await api.post(`/wishlist/${propertyId}`);
      // backend returns array of ObjectIds strings or objects, map to string
      setWishlist(data.map(id => typeof id === 'object' ? id._id : id));
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const signup = async (name, email, phone, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, phone, password, role });
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, wishlist, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};
