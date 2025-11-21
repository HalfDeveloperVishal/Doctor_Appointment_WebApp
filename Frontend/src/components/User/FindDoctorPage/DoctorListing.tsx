import { useState, useEffect } from "react";
import { MapPin, Star, BadgeIndianRupee } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: number;
  full_name: string;
  specialization_display: string;
  years_of_experience: number;
  rating?: number;
  reviews_count?: number;
  address: string;
  consultation_fee: number;
  profile_photo_url?: string;
}

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay) as unknown as number;
  };
};

const DoctorPage = () => {
  const [specialty, setSpecialty] = useState<string>("All Specialties");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const formatFee = (fee: number | string) => {
    if (!fee) return "N/A";
    return Number(fee).toLocaleString("en-IN");
  };

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
  const fetchDoctors = async (search: string = searchQuery, spec: string = specialty) => {
    try {
      let url = "http://localhost:8000/patient/doctor_listing/";
      const params = [];
      if (spec && spec !== "All Specialties") {
        params.push(`specialization=${spec.toLowerCase()}`);
      }
      if (search.trim() !== "") {
        params.push(
          `search=${encodeURIComponent(search.trim().toLowerCase())}`
        );
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
  const handleBookNow = (doctorId: number) => {
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
    <div className="min-h-screen px-6 bg-[var(--color-background)] pb-12">
      {/* Error Alert */}
      {error && (
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto bg-[var(--color-surface)] rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 mb-8 -mt-8 relative z-10">
        <input
          type="text"
          placeholder="Search doctors or clinics..."
          className="outline-none flex-1 border border-gray-200 rounded-xl px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />

        <select
          className="border border-gray-200 rounded-xl px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] flex-1 transition-all bg-white"
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
        <p className="text-center text-[var(--color-text-muted)]">No doctors found.</p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-[var(--color-surface)] rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    doctor.profile_photo_url || "https://via.placeholder.com/80"
                  }
                  alt={doctor.full_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-50"
                />
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text-main)]">
                    {doctor.full_name}
                  </h2>
                  <span className="bg-teal-50 text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block">
                    {doctor.specialization_display}
                  </span>
                </div>
              </div>

              <p className="text-[var(--color-text-muted)] text-sm mt-3">
                {doctor.years_of_experience} years experience
              </p>

              <div className="flex items-center text-sm text-[var(--color-text-muted)] mt-3">
                <Star className="w-4 h-4 text-[var(--color-accent)] mr-1 fill-current" />
                <span className="font-medium text-[var(--color-text-main)]">{doctor.rating || "4.8"}</span>
                <span className="ml-1">
                  ({doctor.reviews_count || "200"} reviews)
                </span>
              </div>

              <div className="flex items-center text-sm text-[var(--color-text-muted)] mt-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span>{doctor.address}</span>
              </div>
              <div className="flex items-center text-sm text-[var(--color-text-muted)] mt-2">
                <BadgeIndianRupee className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-medium text-[var(--color-text-main)]">
                  ₹ {formatFee(doctor.consultation_fee)}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[var(--color-text-main)] hover:bg-gray-50 transition font-medium text-sm">
                  View Profile
                </button>
                <button
                  onClick={() => handleBookNow(doctor.id)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition font-medium text-sm shadow-md"
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
