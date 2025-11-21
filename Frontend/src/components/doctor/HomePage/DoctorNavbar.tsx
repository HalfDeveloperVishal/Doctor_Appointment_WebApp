import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DoctorProfile {
  full_name: string;
  specialization: string;
  [key: string]: any;
}

const DoctorNavbar = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const checkProfile = async () => {
      let token = localStorage.getItem("access_token");


      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8000/doctor/doctor_profile_check/",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setHasProfile(res.data.has_profile);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("Error checking profile:", error.response?.data || error);
        setIsAuthenticated(false);
      }

      try {
        const profileRes = await axios.get(
          "http://localhost:8000/doctor/doctor_profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setProfile(profileRes.data);
      } catch (error: any) {
        console.error("Error fetching profile:", error.response?.data || error);
      }
    };

    checkProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    toast.success("Logged out successfully.");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Home", path: "/doctor-dashboard" },
    { name: "Register Yourself", path: "/doctor-profile-create", show: !hasProfile },
    { name: "Profile", path: "/doctor-profile" },
    { name: "Appointments", path: "/appointment-info" },
  ];

  return (
    <>
      {/* Sidebar (mobile) */}
      <div
        className={`bg-white shadow-lg w-64 fixed top-0 left-0 h-screen transition-transform duration-300 z-50 md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-blue-600"
        >
          ✖
        </button>

        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-800">MedConnect</h1>
          <h2 className="text-lg text-gray-600 mt-1">Doctor Portal</h2>
        </div>

        <nav className="mt-8">
          <h3 className="px-6 py-2 text-gray-500 uppercase text-sm font-semibold">
            Main Menu
          </h3>
          <ul className="px-2">
            {sidebarItems.map(
              (item) =>
                item.show !== false && (
                  <li key={item.name} className="mb-1">
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg ${isActive(item.path)
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
            )}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {profile?.full_name ? profile.full_name.charAt(0) : "N/A"}
            </div>
            <div className="ml-3">
              <p className="font-medium">{profile?.full_name || "N/A"}</p>
              <p className="text-sm text-gray-500">
                {profile?.specialization || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30">
        {/* Left Section - Brand */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-blue-600 md:hidden mr-4"
          >
            ☰
          </button>
          <div className="gap-2 flex justify-between items-center">
            <div className="bg-blue-600 text-white font-bold text-xl rounded-xl px-2 py-1">
              H+
            </div>
            <h1 className="text-xl font-semibold text-gray-800">MedConnect</h1>
          </div>
        </div>

        {/* Center Section - Links */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              {!hasProfile && (
                <Link
                  to="/doctor-profile-create"
                  className={`text-gray-600 hover:text-blue-600 ${isActive("/doctor-profile-create") ? "font-semibold text-blue-600" : ""
                    }`}
                >
                  Register Yourself
                </Link>
              )}
              <Link
                to="/doctor-dashboard"
                className={`text-gray-600 hover:text-blue-600 ${isActive("/doctor-dashboard") ? "font-semibold text-blue-600" : ""
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/doctor-profile"
                className={`text-gray-600 hover:text-blue-600 ${isActive("/doctor-profile") ? "font-semibold text-blue-600" : ""
                  }`}
              >
                Profile
              </Link>
              <Link
                to="/appointment-info"
                className={`text-gray-600 hover:text-blue-600 ${isActive("/appointment-info") ? "font-semibold text-blue-600" : ""
                  }`}
              >
                Appointments
              </Link>

            </>
          )}
        </div>

        {/* Right Section - Auth Buttons */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signup?role=doctor"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Login
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 pt-14 bg-gray-50"></main>
    </>
  );
};

export default DoctorNavbar;
