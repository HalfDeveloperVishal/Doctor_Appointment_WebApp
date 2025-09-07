import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function DoctorProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleWorkingDays = (day) => {
    const updatedDays = formData.working_days.includes(day)
      ? formData.working_days.filter((d) => d !== day)
      : [...formData.working_days, day];
    setFormData({ ...formData, working_days: updatedDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Submitting POST request to /doctor/doctor_profile_create/");

    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    // Handle expired or missing token
    if (!token) {
      if (!refreshToken) {
        toast.error("No valid session found. Please log in again.");
        navigate("/login");
        setIsLoading(false);
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
        setIsLoading(false);
        return;
      }
    }

    const data = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post("http://localhost:8000/doctor/doctor_profile_create/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is set automatically by axios for FormData
        },
        withCredentials: true, // Include cookies for CSRF if needed
      });
      toast.success("Doctor profile created successfully!");
      navigate("/doctor-dashboard");
    } catch (error) {
      console.error("Error creating profile:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).join(", ") ||
        "Failed to create profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Create Doctor Profile</h2>

      <input
        type="text"
        name="phone_number"
        placeholder="Phone Number"
        value={formData.phone_number}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <select
        name="specialization"
        value={formData.specialization}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Specialization</option>
        {SPECIALIZATIONS.map((spec) => (
          <option key={spec.value} value={spec.value}>
            {spec.label}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="years_of_experience"
        placeholder="Years of Experience"
        value={formData.years_of_experience}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
        required
      />

      <input
        type="number"
        step="0.01"
        name="consultation_fee"
        placeholder="Consultation Fee"
        value={formData.consultation_fee}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
        required
      />

      <textarea
        name="qualifications"
        placeholder="Qualifications"
        value={formData.qualifications}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        required
      />

      <input
        type="text"
        name="clinic_name"
        placeholder="Clinic Name"
        value={formData.clinic_name}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <textarea
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        required
      />

      <div>
        <label className="block font-semibold mb-2">Working Days:</label>
        <div className="flex flex-wrap gap-4">
          {DAYS_OF_WEEK.map((day) => (
            <label key={day.value} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.working_days.includes(day.value)}
                onChange={() => handleWorkingDays(day.value)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <input
        type="time"
        name="start_time"
        value={formData.start_time}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <input
        type="time"
        name="end_time"
        value={formData.end_time}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <input
        type="number"
        name="appointment_duration"
        placeholder="Appointment Duration (minutes)"
        value={formData.appointment_duration}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="1"
        required
      />

      <textarea
        name="bio"
        placeholder="Bio"
        value={formData.bio}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        required
      />

      <input
        type="file"
        name="profile_photo"
        onChange={handleChange}
        className="w-full p-2 border rounded"
        accept="image/*"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}