import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Navbar from "../HomePage/Navbar";

const MultiStepSlotBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [disabledDates, setDisabledDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    reason: "",
    symptoms: "",
  });

  // 🔐 Check login on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to book an appointment.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch user's previous bookings
  useEffect(() => {
    const fetchDisabledDates = async () => {
      try {
        const res = await axios.get("http://localhost:8000/doctor/booking-info/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const bookedDates = res.data
          .filter((b) => b.patient_id === parseInt(localStorage.getItem("user_id")))
          .map((b) => new Date(b.date));
        setDisabledDates(bookedDates);
      } catch (err) {
        console.error("Error fetching disabled dates:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/login");
        }
      }
    };
    fetchDisabledDates();
  }, [id, navigate]);

  const fetchSlots = async (date) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        `http://localhost:8000/patient/${id}/available_slots/?date=${date}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      setSlots(res.data.slots || []);
      setMessage(res.data.message || "");
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (err.response?.status === 401) {
        alert("Please login to view available slots.");
        navigate("/login");
      } else {
        setMessage("Error fetching slots");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) fetchSlots(format(date, "yyyy-MM-dd"));
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setMessage("Please select date and slot");
      return;
    }

    const payload = {
      date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      full_name: formData.fullName,
      email: formData.email,
      phone_number: formData.phoneNumber,
      date_of_birth: formData.dob,
      reason_to_visit: formData.reason,
      symptoms_or_concerns: formData.symptoms,
    };

    try {
      await axios.post(
        `http://localhost:8000/patient/${id}/book_slot/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      setSuccessMsg(
        `Appointment booked successfully for ${selectedSlot.start_time} - ${selectedSlot.end_time}`
      );
      setStep(4);
      setTimeout(() => navigate("/"), 4000);
    } catch (err) {
      console.error("Booking failed:", err);
      if (err.response?.status === 401) {
        alert("Please login to book an appointment.");
        navigate("/login");
      } else {
        setMessage(err.response?.data?.error || "Failed to book slot");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,_#e2e8f0_1px,_transparent_1px),linear-gradient(to_bottom,_#e2e8f0_1px,_transparent_1px)]
                      bg-[length:20px_30px]
                      mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,_black_60%,_transparent_100%)]
                      -webkit-mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,_black_60%,_transparent_100%)]"
        ></div>

        <div className="relative z-10 max-w-3xl mx-auto p-6 border rounded-lg shadow bg-white mt-24 mb-20">
          {/* Progress bar */}
          <div className="flex items-center justify-center mb-8 ml-30">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300 ${
                    step >= num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-500 ${
                      step > num ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step Components */}
          {step === 1 && (
            <PersonalInfo formData={formData} handleChange={handleChange} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <MedicalInfo formData={formData} handleChange={handleChange} onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <SlotBooking
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              handleDateChange={handleDateChange}
              slots={slots}
              setSelectedSlot={setSelectedSlot}
              loading={loading}
              message={message}
              onBack={() => setStep(2)}
              onBook={handleBooking}
            />
          )}
          {step === 4 && <SuccessPage successMsg={successMsg} />}
        </div>
      </div>
    </>
  );
};

// -------- Child Components --------

const PersonalInfo = React.memo(({ formData, handleChange, onNext }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
    <div className="space-y-4">
      <Input label="Full Name" name="fullName" required value={formData.fullName} onChange={handleChange} />
      <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
      <Input label="Phone Number" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} />
      <Input label="Date of Birth" name="dob" type="date" required value={formData.dob} onChange={handleChange} />
    </div>
    <NavigationButtons next={onNext} disableNext={!formData.fullName || !formData.phoneNumber || !formData.dob} />
  </div>
));

const MedicalInfo = React.memo(({ formData, handleChange, onBack, onNext }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Medical Information</h2>
    <div className="space-y-4">
      <TextArea label="Reason to Visit" name="reason" value={formData.reason} onChange={handleChange} />
      <TextArea label="Symptoms / Concerns" name="symptoms" value={formData.symptoms} onChange={handleChange} />
    </div>
    <NavigationButtons back={onBack} next={onNext} />
  </div>
));

const SlotBooking = React.memo(
  ({ selectedDate, selectedSlot, handleDateChange, slots, setSelectedSlot, loading, message, onBack, onBook }) => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Select Appointment Slot</h2>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        className="custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-gray-100"
        placeholderText="Select a date"
        minDate={new Date()}
      />
      {message && <p className="mt-3 text-red-500">{message}</p>}
      {loading && <p className="mt-4">Loading slots...</p>}
      {!loading && slots.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(slot)}
              disabled={slot.is_booked}
              className={`px-4 py-2 rounded-lg border text-sm ${
                slot.is_booked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {slot.start_time} - {slot.end_time}
            </button>
          ))}
        </div>
      )}
      <NavigationButtons back={onBack} next={onBook} nextLabel="Book Appointment" />
    </div>
  )
);

const SuccessPage = React.memo(({ successMsg }) => (
  <div className="text-center mt-20">
    <h2 className="text-2xl font-bold text-green-600 mb-2">Appointment Confirmed 🎉</h2>
    <p className="text-gray-600">{successMsg}</p>
    <p className="text-sm text-gray-500 mt-2">Redirecting to homepage...</p>
  </div>
));

// -------- Shared Components --------

const Input = ({ label, name, value, onChange, type = "text", required = false }) => (
  <div className="w-full max-w-xs sm:max-w-full font-mono">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-gray-100"
      placeholder={`Enter ${label.toLowerCase()} here`}
    />
  </div>
);

const TextArea = ({ label, name, value, onChange }) => (
  <div className="w-full max-w-xs sm:max-w-full font-mono">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows="3"
      className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-gray-100"
      placeholder={`Enter ${label.toLowerCase()} here`}
    />
  </div>
);

const NavigationButtons = ({ back, next, nextLabel = "Continue", disableNext = false }) => (
  <div className="flex justify-between mt-6 items-center">
    {back ? (
      <button
        onClick={back}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
      >
        Back
      </button>
    ) : (
      <div></div>
    )}
    <button
      onClick={next}
      disabled={disableNext}
      className={`relative inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 
        ${
          disableNext
            ? "opacity-50 cursor-not-allowed bg-gray-500"
            : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]"
        }`}
    >
      <svg
        className={`w-5 h-5 mr-2 transition-transform duration-300 ${
          disableNext ? "" : "group-hover:rotate-12"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      {nextLabel}
    </button>
  </div>
);

export default MultiStepSlotBooking;
