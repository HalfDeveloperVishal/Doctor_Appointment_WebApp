import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navbar: React.FC = () => {
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
    <nav className="fixed top-0 left-0 w-full bg-[var(--color-surface)] shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-primary)] text-white font-bold text-xl rounded-xl px-2 py-1">
            H+
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-main)] font-[var(--font-heading)]">MedConnect</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium transition-colors">
            Home
          </Link>
          <Link to="/find-doctor" className="text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium transition-colors">
            Find Doctor
          </Link>
          <Link
            to="/patient-appointment"
            className="text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium transition-colors"
          >
            Appointment
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 font-medium transition-colors shadow-sm"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full border border-gray-200 text-[var(--color-text-main)] hover:bg-gray-50 font-medium transition-colors"
              >
                Login
              </Link>
              <button
                onClick={handleSignupClick}
                className="px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--color-text-main)]">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[var(--color-surface)] shadow-lg z-40 p-4 md:hidden border-t border-gray-100">
          <div className="space-y-4">
            <Link
              to="/patient"
              className="block text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium"
            >
              Home
            </Link>
            <Link
              to="/find-doctor"
              className="block text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium"
            >
              Find Doctor
            </Link>
            <Link
              to="/patient-appointment"
              className="block text-[var(--color-text-main)] hover:text-[var(--color-primary)] font-medium"
            >
              Appointment
            </Link>

            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-center rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full px-4 py-3 text-center rounded-xl border border-gray-200 text-[var(--color-text-main)] hover:bg-gray-50 font-medium"
                  >
                    Login
                  </Link>
                  <button
                    onClick={handleSignupClick}
                    className="w-full px-4 py-3 text-center rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-medium shadow-md"
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
