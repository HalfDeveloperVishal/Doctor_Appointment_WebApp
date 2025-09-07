import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorNavbar = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const checkProfile = async () => {
      let token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token) {
        if (!refreshToken) {
          toast.error("No valid session found. Please log in again.");
          navigate("/login");
          return;
        }

        try {
          const res = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });
          token = res.data.access;
          localStorage.setItem("access_token", token);
          toast.info("Session token refreshed successfully.");
        } catch (err) {
          console.error("Token refresh failed:", err);
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
      }

      try {
        const res = await axios.get("http://localhost:8000/doctor/doctor_profile_check/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setHasProfile(res.data.has_profile);
      } catch (error) {
        console.error("Error checking profile:", error.response?.data || error);
        toast.error("Failed to check profile status. Please try again.");
      }

      try {
        const profileRes = await axios.get("http://localhost:8000/doctor/doctor_profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setProfile(profileRes.data);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error);
        toast.error("Failed to load profile data.");
      }
    };

    checkProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Home", path: "/doctor-dashboard" },
    { name: "Register Yourself", path: "/doctor-profile-create", show: !hasProfile },
    { name: "Profile", path: "/doctor-profile" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg w-64 fixed top-0 left-0 h-screen transition-transform duration-300 z-50 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-blue-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-800">HealthCare</h1>
          <h2 className="text-lg text-gray-600 mt-1">Doctor Portal</h2>
        </div>

        <nav className="mt-8">
          <h3 className="px-6 py-2 text-gray-500 uppercase text-sm font-semibold">Main Menu</h3>
          <ul className="px-2">
            {sidebarItems.map((item) =>
              item.show !== false && (
                <li key={item.name} className="mb-1">
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive(item.path) ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-3 ${
                        isActive(item.path) ? "bg-blue-600" : "bg-transparent"
                      }`}
                    ></span>
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
              <p className="text-sm text-gray-500">{profile?.specialization || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-blue-600 md:hidden mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-blue-600">MedConnect</h1>
        </div>

        <div className="flex items-center gap-4">
          {!hasProfile && (
            <Link
              to="/doctor-profile-create"
              className="text-gray-600 hover:text-blue-600"
            >
              Register Yourself
            </Link>
          )}
          <Link to="/doctor-profile" className="text-gray-600 hover:text-blue-600">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pt-14  bg-gray-50">
        {/* Content will be rendered here by Layout */}
      </main>
    </>
  );
};

export default DoctorNavbar;