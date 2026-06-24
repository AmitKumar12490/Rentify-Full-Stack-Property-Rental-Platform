import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData.name, formData.email, formData.phone, formData.password, formData.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Create an Account</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" name="name" required value={formData.name} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" name="email" required value={formData.email} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input 
            type="tel" name="phone" required value={formData.phone} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" name="password" required value={formData.password} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="User" checked={formData.role === 'User'} onChange={handleChange} />
              Tenant
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="Owner" checked={formData.role === 'Owner'} onChange={handleChange} />
              Owner
            </label>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600 text-sm">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
