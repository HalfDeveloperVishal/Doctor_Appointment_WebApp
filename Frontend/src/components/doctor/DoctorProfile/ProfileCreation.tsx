import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000";

const SPECIALIZATIONS = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface ProfileData {
  phone_number: string;
  specialization: string;
  years_of_experience: string;
  consultation_fee: string;
  qualifications: string;
  clinic_name: string;
  address: string;
  working_days: string[];
  start_time: string;
  end_time: string;
  appointment_duration: string;
  bio: string;
  profile_photo: File | null;
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string | null | undefined;
}

export default function DoctorProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileData>({
    phone_number: "",
    specialization: "",
    years_of_experience: "",
    consultation_fee: "",
    qualifications: "",
    clinic_name: "",
    address: "",
    working_days: [],
    start_time: "",
    end_time: "",
    appointment_duration: "",
    bio: "",
    profile_photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const files = (e.target as HTMLInputElement).files;

    setErrors((prev) => ({ ...prev, [name]: null }));
    if (type === "file" && files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleWorkingDays = (day: string) => {
    const updatedDays = formData.working_days.includes(day)
      ? formData.working_days.filter((d) => d !== day)
      : [...formData.working_days, day];
    setFormData({ ...formData, working_days: updatedDays });
    setErrors((prev) => ({ ...prev, working_days: null }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (formData.working_days.length === 0) {
      newErrors.working_days = "Please select at least one working day";
    }
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/token/refresh/`, { refresh: refreshToken });
      const newToken = res.data.access;
      localStorage.setItem("access_token", newToken);
      return newToken;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw new Error("Session expired");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    setIsLoading(true);

    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!token && !refreshToken) {
      toast.error("Please log in first.");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    if (!token && refreshToken) {
      try {
        token = await refreshAccessToken(refreshToken);
      } catch {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        setIsLoading(false);
        return;
      }
    }

    const data = new FormData();
    for (const key in formData) {
      const value = formData[key];
      if (key === "working_days") {
        (value as string[]).forEach((day) => data.append(key, day)); // send each day individually
      } else if (key === "profile_photo" && value instanceof File) {
        data.append(key, value);
      } else if (value !== null && value !== "") {
        data.append(key, value as string);
      }
    }

    try {
      await axios.post(`${API_URL}/doctor/doctor_profile_create/`, data, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Doctor profile created successfully!");
      navigate("/doctor-dashboard");
    } catch (error: any) {
      console.error("Error creating profile:", error.response?.data || error);
      if (error.response?.status === 401 && refreshToken) {
        try {
          token = await refreshAccessToken(refreshToken);
          await axios.post(`${API_URL}/doctor/doctor_profile_create/`, data, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          toast.success("Doctor profile created successfully!");
          navigate("/doctor-dashboard");
          return;
        } catch {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
      }

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "object") {
          setErrors(errorData);
          const firstError = Object.values(errorData)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error((errorMessage as string) || "Failed to create profile");
        } else {
          toast.error(errorData.detail || "Failed to create profile");
        }
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg space-y-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Doctor Profile</h2>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phone_number"
            placeholder="+1 234 567 8900"
            value={formData.phone_number}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone_number ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.specialization ? "border-red-500" : "border-gray-300"
              }`}
            required
          >
            <option value="">Select Specialization</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
          {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
        </div>

        {/* Years of Experience & Consultation Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
            <input
              type="number"
              name="years_of_experience"
              placeholder="5"
              value={formData.years_of_experience}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.years_of_experience ? "border-red-500" : "border-gray-300"
                }`}
              min="0"
              required
            />
            {errors.years_of_experience && <p className="text-red-500 text-sm mt-1">{errors.years_of_experience}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($) *</label>
            <input
              type="number"
              step="0.01"
              name="consultation_fee"
              placeholder="100.00"
              value={formData.consultation_fee}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.consultation_fee ? "border-red-500" : "border-gray-300"
                }`}
              min="0"
              required
            />
            {errors.consultation_fee && <p className="text-red-500 text-sm mt-1">{errors.consultation_fee}</p>}
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
          <textarea
            name="qualifications"
            placeholder="MD, MBBS, Board Certified..."
            value={formData.qualifications}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.qualifications ? "border-red-500" : "border-gray-300"
              }`}
            rows={3}
            required
          />
          {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
        </div>

        {/* Clinic Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name *</label>
          <input
            type="text"
            name="clinic_name"
            placeholder="City Medical Center"
            value={formData.clinic_name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.clinic_name ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
          {errors.clinic_name && <p className="text-red-500 text-sm mt-1">{errors.clinic_name}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <textarea
            name="address"
            placeholder="123 Main St, Suite 100, City, State, ZIP"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : "border-gray-300"
              }`}
            rows={3}
            required
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* Working Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Working Days *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.working_days.includes(day.value)
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={formData.working_days.includes(day.value)}
                  onChange={() => handleWorkingDays(day.value)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium">{day.label}</span>
              </label>
            ))}
          </div>
          {errors.working_days && <p className="text-red-500 text-sm mt-2">{errors.working_days}</p>}
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.start_time ? "border-red-500" : "border-gray-300"
                }`}
              required
            />
            {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.end_time ? "border-red-500" : "border-gray-300"
                }`}
              required
            />
            {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
          </div>
        </div>

        {/* Appointment Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Duration (minutes) *
          </label>
          <input
            type="number"
            name="appointment_duration"
            placeholder="30"
            value={formData.appointment_duration}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.appointment_duration ? "border-red-500" : "border-gray-300"
              }`}
            min="5"
            step="5"
            required
          />
          {errors.appointment_duration && (
            <p className="text-red-500 text-sm mt-1">{errors.appointment_duration}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            name="bio"
            placeholder="Write something about yourself..."
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <input
            type="file"
            name="profile_photo"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            accept="image/*"
          />
          {errors.profile_photo && <p className="text-red-500 text-sm mt-1">{errors.profile_photo}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating Profile..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
