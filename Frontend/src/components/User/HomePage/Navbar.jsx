// ✅ Navbar.jsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-xl rounded-xl px-2 py-1">H+</div>
          <h1 className="text-xl font-semibold text-gray-800">HealthCare</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
          <Link to="/find-doctor" className="text-gray-700 hover:text-blue-600">Find Doctor</Link>
          <a href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a>
        </div>
        <div className="hidden md:flex gap-3">
          {isAuthenticated ? (
            <button onClick={logout} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">Logout</button>
          ) : (
            <>
              <a href="/login" className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100">Login</a>
              <Link to="/choose-role" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
            </>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-40 p-4 md:hidden">
          <div className="space-y-3">
            <a href="/" className="block text-gray-700 hover:text-blue-600">Home</a>
            <Link to="/find-doctor" className="text-gray-700 hover:text-blue-600">Find Doctor</Link>
            <a href="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</a>
            <div className="flex flex-col gap-2 mt-3">
              {isAuthenticated ? (
                <button onClick={logout} className="w-full px-4 py-2 text-center rounded-md bg-red-500 text-white hover:bg-red-600">Logout</button>
              ) : (
                <>
                  <a href="/login" className="w-full px-4 py-2 text-center rounded-md border border-gray-300 hover:bg-gray-100">Login</a>
                  <Link to="/choose-role" className="w-full px-4 py-2 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
