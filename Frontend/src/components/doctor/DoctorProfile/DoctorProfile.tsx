import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MdEmail,
  MdCall,
  MdLocationOn,
  MdStar,
  MdCameraAlt,
} from "react-icons/md";
import { BadgeIndianRupee } from "lucide-react";

interface DoctorProfile {
  full_name: string;
  email: string;
  phone_number: string;
  clinic_name: string;
  years_of_experience: number;
  consultation_fee: number;
  specialization: string;
  specialization_display?: string;
  bio: string;
  profile_photo?: string | null;
  is_accepting_appointments: boolean;
  working_days: string[];
  start_time: string;
  end_time: string;
  appointment_duration: number;
  qualifications: string;
  total_patients?: number;
  [key: string]: any;
}

const DoctorProfileView = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailabilityEditing, setIsAvailabilityEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const durationOptions = [15, 30, 45, 60];

  const specializations = [
    { value: "cardiology", label: "Cardiology" },
    { value: "dermatology", label: "Dermatology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
  ];

  const formatFee = (fee: number | undefined) => {
    if (!fee) return "N/A";
    return Number(fee).toLocaleString("en-IN");
  };

  // Fetch profile with token refresh logic
  useEffect(() => {
    const fetchProfile = async () => {
      let token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token) {
        if (!refreshToken) {
          toast.error("No valid session found. Please log in again.");
          navigate("/login");
          setIsLoading(false);
          return;
        }
        try {
          const res = await axios.post(
            "http://localhost:8000/api/token/refresh/",
            { refresh: refreshToken }
          );
          token = res.data.access;
          localStorage.setItem("access_token", token || "");
          toast.info("Session token refreshed successfully.");
        } catch {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          setIsLoading(false);
          return;
        }
      }

      try {
        const res = await axios.get(
          "http://localhost:8000/doctor/doctor_profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setProfile(res.data);
        setEditedProfile({ ...res.data, is_accepting_appointments: true });
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handlers
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (profile) {
      setEditedProfile({ ...profile, is_accepting_appointments: true });
    }
    setIsEditing(false);
    setIsAvailabilityEditing(false);
    setSelectedFile(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleDayChange = (day: string) => {
    setEditedProfile((prev) => {
      if (!prev) return null;
      let working_days = [...(prev.working_days || [])];
      if (working_days.includes(day))
        working_days = working_days.filter((d) => d !== day);
      else working_days.push(day);
      return { ...prev, working_days };
    });
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    let token = localStorage.getItem("access_token");

    const formatTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);
    const payload = {
      ...editedProfile,
      years_of_experience: Number(editedProfile.years_of_experience),
      consultation_fee: Number(editedProfile.consultation_fee),
      appointment_duration: Number(editedProfile.appointment_duration),
      working_days: editedProfile.working_days || [],
      start_time: formatTime(editedProfile.start_time),
      end_time: formatTime(editedProfile.end_time),
    };

    // Remove the profile photo from the payload
    if ('profile_photo' in payload) {
      delete payload.profile_photo;
    }

    try {
      const response = await axios.put(
        "http://localhost:8000/doctor/doctor_profile/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setProfile(response.data);
      setEditedProfile({ ...response.data, is_accepting_appointments: true });
      setIsEditing(false);
      setIsAvailabilityEditing(false);
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      console.error("Save error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.values(err.response.data).flat().join(", ")
          : "Failed to save profile changes.");
      toast.error(errorMessage);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await handleSavePhoto(file);
    }
  };

  const handleSavePhoto = async (file: File) => {
    let token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      const response = await axios.put(
        "http://localhost:8000/doctor/doctor_profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setProfile(response.data);
      setEditedProfile({ ...response.data, is_accepting_appointments: true });
      setSelectedFile(null);
      toast.success("Profile photo updated successfully.");
    } catch (err: any) {
      console.error("Photo save error:", err.response?.data || err.message);
      toast.error("Failed to update profile photo.");
    }
  };

  // Availability toggle logic
  const handleToggleAvailability = async () => {
    if (isAvailabilityEditing) {
      await handleSaveProfile(); // Save updated profile when exiting edit mode
      setIsAvailabilityEditing(false);
    } else {
      setIsAvailabilityEditing(true);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-6">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-lg bg-white shadow rounded p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {error === "Doctor profile not found." && (
            <Link
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              to="/doctor-profile-create"
            >
              Create Profile
            </Link>
          )}
        </div>
      </div>
    );

  if (!editedProfile) return null;

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Overview */}
        <div className="lg:w-1/3">
          <div className="sticky top-18 bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : editedProfile.profile_photo ||
                      "https://via.placeholder.com/150"
                  }
                  alt="Avatar"
                  className="w-24 h-24 rounded-full mb-2 object-cover"
                />
                {isEditing && (
                  <>
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer hover:bg-blue-600">
                      <MdCameraAlt size={16} />
                      <input
                        type="file"
                        name="profile_photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                  </>
                )}
              </div>
              <h3 className="text-xl font-semibold">
                {editedProfile.full_name || "N/A"}
              </h3>
              <p className="text-gray-600">
                {editedProfile.specialization_display ||
                  editedProfile.specialization?.charAt(0).toUpperCase() +
                  editedProfile.specialization?.slice(1) ||
                  "N/A"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MdStar className="text-yellow-400" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-sm text-gray-500">(247 reviews)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MdEmail /> {editedProfile.email}
              </div>
              <div className="flex items-center gap-2">
                <MdCall /> {editedProfile.phone_number}
              </div>
              <div className="flex items-center gap-2">
                <MdLocationOn /> {editedProfile.clinic_name}
              </div>
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="w-5 h-5 text-green-600" />
                <span className="font-medium">
                  ₹ {formatFee(editedProfile.consultation_fee)}
                </span>
                <span className="text-gray-600 text-sm">per consultation</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {editedProfile.total_patients || 0}
                </p>
                <p className="text-sm text-gray-500">Total Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {editedProfile.years_of_experience || 0}
                </p>
                <p className="text-sm text-gray-500">Years Experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Basic Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Full Name",
                  name: "full_name",
                  type: "text",
                  readonly: false,
                },
                {
                  label: "Email",
                  name: "email",
                  type: "email",
                  readonly: true,
                },
                {
                  label: "Phone Number",
                  name: "phone_number",
                  type: "text",
                  readonly: true,
                },
                { label: "Clinic Name", name: "clinic_name", type: "text" },
                {
                  label: "Years of Experience",
                  name: "years_of_experience",
                  type: "number",
                },
                {
                  label: "Consultation Fee",
                  name: "consultation_fee",
                  type: "number",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={editedProfile[field.name] || ""}
                    readOnly={!isEditing || field.readonly}
                    onChange={handleChange}
                    className={`w-full p-2 border border-gray-200 rounded ${!isEditing || field.readonly ? "bg-gray-50" : ""
                      }`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={editedProfile.specialization || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border border-gray-200 rounded ${!isEditing ? "bg-gray-50" : ""
                    }`}
                >
                  {specializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={editedProfile.bio || ""}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full p-2 border border-gray-200 rounded min-h-[100px] ${!isEditing ? "bg-gray-50" : ""
                  }`}
              />
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Availability Settings */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Availability Settings</h2>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p>Accepting Appointments</p>
                <p className="text-sm text-gray-500">
                  Click to edit availability
                </p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={editedProfile.is_accepting_appointments}
                  onChange={handleToggleAvailability}
                />
                <span
                  className={`absolute top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors
                before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform
                ${editedProfile.is_accepting_appointments
                      ? "bg-blue-500 before:translate-x-6"
                      : ""
                    }`}
                ></span>
              </label>
            </div>

            <div>
              <h3 className="font-medium mb-2">Working Days</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const dayLower = day.toLowerCase();
                  const isSelected =
                    editedProfile.working_days?.includes(dayLower) || false;

                  return isAvailabilityEditing ? (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDayChange(dayLower)}
                        className="h-4 w-4"
                      />
                      {day}
                    </label>
                  ) : (
                    <span
                      key={day}
                      className={`px-3 py-1 rounded-full text-sm ${isSelected
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {["start_time", "end_time"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 mb-1">
                    {field
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    type="time"
                    name={field}
                    value={editedProfile[field] || ""}
                    onChange={handleChange}
                    readOnly={!isAvailabilityEditing}
                    className={`w-full p-2 border border-gray-200 rounded ${!isAvailabilityEditing ? "bg-gray-50" : ""
                      }`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700 mb-1">
                  Appointment Duration
                </label>
                <select
                  name="appointment_duration"
                  value={editedProfile.appointment_duration || ""}
                  onChange={handleChange}
                  disabled={!isAvailabilityEditing}
                  className={`w-full p-2 border border-gray-200 rounded ${!isAvailabilityEditing ? "bg-gray-50" : ""
                    }`}
                >
                  {durationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAvailabilityEditing && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleToggleAvailability}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">
              Qualifications & Certifications
            </h2>
            {isEditing ? (
              <textarea
                className="w-full p-2 border border-gray-200 rounded min-h-[100px]"
                value={editedProfile.qualifications || ""}
                name="qualifications"
                onChange={handleChange}
                placeholder="Enter qualifications separated by commas"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedProfile.qualifications ? (
                  editedProfile.qualifications.split(",").map((q: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {q.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">
                    No qualifications listed.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileView;
