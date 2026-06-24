import { useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    setFormData({ name: user.name, email: user.email, phone: user.phone || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      window.location.reload(); 
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Profile</h2>
      {message && <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4 text-sm">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Save Changes"}
        </button>
      </form>
    </div>
  );
};
export default Profile;
