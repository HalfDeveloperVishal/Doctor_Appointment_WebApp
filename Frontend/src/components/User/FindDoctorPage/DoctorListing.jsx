import React, { useState, useEffect } from "react";
import { MapPin, Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const DoctorPage = () => {
  const [specialty, setSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch specialties (static for now)
  useEffect(() => {
    setSpecialties([
      "All Specialties",
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Orthopedics",
    ]);
  }, []);

  // Fetch doctors from backend (no auth required)
  const fetchDoctors = async (search = searchQuery, spec = specialty) => {
    try {
      let url = "http://localhost:8000/patient/doctor_listing/";
      const params = [];
      if (spec && spec !== "All Specialties") {
        params.push(`specialization=${spec.toLowerCase()}`);
      }
      if (search.trim() !== "") {
        params.push(`search=${encodeURIComponent(search.trim().toLowerCase())}`);
      }
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await axios.get(url);
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors. Please try again later.");
    }
  };

  const debouncedFetch = debounce(fetchDoctors, 300);
  useEffect(() => {
    debouncedFetch(searchQuery, specialty);
  }, [searchQuery, specialty]);

  // Handle "Book Now" click
  const handleBookNow = (doctorId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("❌ Please log in to book an appointment.");
      // Hide error after 4 seconds
      setTimeout(() => setError(""), 4000);
      return; // Stay on the page
    }

    // Navigate to booking page if authenticated
    navigate(`/doctor/${doctorId}/slots`);
  };

  return (
    <div className="min-h-screen px-6" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Error Alert */}
      {error && (
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search doctors or clinics..."
          className="outline-none flex-1 border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />

        <select
          className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500 flex-1"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          {specialties.map((spec) => (
            <option key={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Doctor Listing */}
      {doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors found.</p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-full transform transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <img
                  src={doctor.profile_photo_url || "https://via.placeholder.com/80"}
                  alt={doctor.full_name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {doctor.full_name}
                  </h2>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mt-1 inline-block">
                    {doctor.specialization_display}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mt-2">
                {doctor.years_of_experience} years experience
              </p>

              <div className="flex items-center text-sm text-gray-600 mt-2">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-medium">{doctor.rating || "4.8"}</span>
                <span className="ml-1">
                  ({doctor.reviews_count || "200"} reviews)
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                <span>{doctor.address}</span>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition">
                  View Profile
                </button>
                <button
                  onClick={() => handleBookNow(doctor.id)}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPage;
