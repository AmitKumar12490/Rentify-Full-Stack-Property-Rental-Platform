import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building, Heart, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg shadow-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <Building className="h-8 w-8 text-indigo-600" />
          Rentify
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
          
          {user ? (
            <>
              {user.role === 'Owner' && (
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
              )}
              {user.role === 'User' && (
                <Link to="/wishlist" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
                  <Heart className="h-5 w-5" /> Wishlist
                </Link>
              )}
              <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-200">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
                  <UserIcon className="h-4 w-4" />
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-bold transition">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-200">
              <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition">Login</Link>
              <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
