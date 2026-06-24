import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PropertyDetails from './pages/PropertyDetails';
import Wishlist from './pages/Wishlist';
import OwnerDashboard from './pages/OwnerDashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/dashboard" element={<OwnerDashboard />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
