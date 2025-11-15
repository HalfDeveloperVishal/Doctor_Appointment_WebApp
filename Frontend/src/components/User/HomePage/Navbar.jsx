import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("isAuthenticated");
    logout();
    navigate("/");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignupClick = () => {
    navigate("/signup?role=patient"); // ✅ patient role pre-selected
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-xl rounded-xl px-2 py-1">
            H+
          </div>
          <h1 className="text-xl font-semibold text-gray-800">MedConnect</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link to="/find-doctor" className="text-gray-700 hover:text-blue-600">
            Find Doctor
          </Link>
          <Link
            to="/patient-appointment"
            className="text-gray-700 hover:text-blue-600"
          >
            Appointment
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Login
              </Link>
              <button
                onClick={handleSignupClick}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-40 p-4 md:hidden">
          <div className="space-y-3">
            <Link
              to="/patient"
              className="block text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/find-doctor"
              className="block text-gray-700 hover:text-blue-600"
            >
              Find Doctor
            </Link>
            <Link
              to="/patient-appointment"
              className="text-gray-700 hover:text-blue-600"
            >
              Appointment
            </Link>

            <div className="flex flex-col gap-2 mt-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-center rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full px-4 py-2 text-center rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <button
                    onClick={handleSignupClick}
                    className="w-full px-4 py-2 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
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
