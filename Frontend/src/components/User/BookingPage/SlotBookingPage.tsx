import React, { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Navbar from "../HomePage/Navbar";

// Define interfaces
interface Slot {
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface BookingFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  reason: string;
  symptoms: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: RazorpayError) => void) => void;
    };
  }
}

const MultiStepSlotBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("counter");
  const [doctorFee, setDoctorFee] = useState<number>(0);

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    reason: "",
    symptoms: "",
  });

  useEffect(() => {
    const fetchDoctorFee = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/doctor/${id}/details/`);
        setDoctorFee(res.data.consultation_fee);
      } catch (err) {
        console.error("Error fetching doctor fee:", err);
      }
    };

    fetchDoctorFee();
  }, [id]);

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay script loaded successfully");
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to book an appointment.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        // Process booked dates if needed in the future
        const _bookedDates = res.data
          .filter((b: { patient_id: number }) => b.patient_id === parseInt(localStorage.getItem("user_id") || ""))
          .map((b: { date: string }) => new Date(b.date));
        // TODO: Use _bookedDates to disable dates in DatePicker if needed
        console.log("Booked dates fetched:", _bookedDates.length);
      } catch (err) {
        console.error("Error fetching disabled dates:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/login");
        }
      }
    };
    fetchDisabledDates();
  }, [id, navigate]);

  const fetchSlots = async (date: string): Promise<void> => {
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
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert("Please login to view available slots.");
        navigate("/login");
      } else {
        setMessage("Error fetching slots");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) fetchSlots(format(date, "yyyy-MM-dd"));
  };

  // Payment & Booking Logic
  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setMessage("Please select date and slot");
      return;
    }

    setMessage("");
    setSuccessMsg("");

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
      payment_method: paymentMethod,
    };

    try {
      setBookingLoading(true);

      const bookingRes = await axios.post(
        `http://localhost:8000/patient/${id}/book_slot/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );

      const booking_id = bookingRes.data.id;
      const startTime = selectedSlot.start_time;
      const endTime = selectedSlot.end_time;

      if (paymentMethod === "counter") {
        setBookingLoading(false);
        setSuccessMsg(`Appointment booked successfully for ${startTime} - ${endTime}`);
        setStep(4);
        setTimeout(() => navigate("/"), 4000);
      } else {
        console.log("Initiating online payment...");

        if (!window.Razorpay) {
          setMessage("Payment gateway not loaded. Please refresh and try again.");
          setBookingLoading(false);
          return;
        }

        const orderRes = await axios.post(
          "http://localhost:8000/patient/create_payment_order/",
          { booking_id, amount: doctorFee },
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );

        const { order_id, amount: r_amount, currency, razorpay_key } = orderRes.data;
        console.log("Payment order created:", order_id);

        setBookingLoading(false);

        const options: RazorpayOptions = {
          key: razorpay_key,
          amount: r_amount,
          currency: currency,
          order_id: order_id,
          name: "Doctor Appointment",
          description: "Appointment Payment",
          handler: async function (response: RazorpayResponse) {
            console.log("Payment successful:", response);
            try {
              setBookingLoading(true);

              await axios.post(
                "http://localhost:8000/patient/verify_payment/",
                {
                  booking_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
              );

              setBookingLoading(false);
              setSuccessMsg(`Appointment booked successfully for ${startTime} - ${endTime}`);
              setStep(4);
              setTimeout(() => navigate("/"), 4000);
            } catch (err) {
              console.error("Payment verification failed:", err);
              setBookingLoading(false);
              setMessage("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phoneNumber,
          },
          theme: { color: "#6366f1" },
          modal: {
            ondismiss: function () {
              console.log("Payment cancelled by user");
              setMessage("Payment cancelled. Your booking is still pending. Please complete payment to confirm.");
            }
          }
        };

        console.log("Opening Razorpay modal...");
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: RazorpayError) {
          console.error("Payment failed:", response.error);
          setMessage(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingLoading(false);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert("Please login to book an appointment.");
        navigate("/login");
      } else if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.error || "Failed to book slot");
      } else {
        setMessage("Failed to book slot");
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
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300 ${step >= num
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-500 bg-white"
                    }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-500 ${step > num ? "bg-blue-600" : "bg-gray-300"
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
              bookingLoading={bookingLoading}
              message={message}
              onBack={() => setStep(2)}
              onBook={handleBooking}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              doctorFee={doctorFee}
            />
          )}
          {step === 4 && <SuccessPage successMsg={successMsg} />}
        </div>
      </div>
    </>
  );
};

// -------- Child Components --------

interface PersonalInfoProps {
  formData: BookingFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
}

const PersonalInfo = React.memo(({ formData, handleChange, onNext }: PersonalInfoProps) => (
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

interface MedicalInfoProps {
  formData: BookingFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
  onNext: () => void;
}

const MedicalInfo = React.memo(({ formData, handleChange, onBack, onNext }: MedicalInfoProps) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Medical Information</h2>
    <div className="space-y-4">
      <TextArea label="Reason to Visit" name="reason" value={formData.reason} onChange={handleChange} />
      <TextArea label="Symptoms / Concerns" name="symptoms" value={formData.symptoms} onChange={handleChange} />
    </div>
    <NavigationButtons back={onBack} next={onNext} />
  </div>
));

interface SlotBookingProps {
  selectedDate: Date | null;
  selectedSlot: Slot | null;
  handleDateChange: (date: Date | null) => void;
  slots: Slot[];
  setSelectedSlot: Dispatch<SetStateAction<Slot | null>>;
  loading: boolean;
  bookingLoading: boolean;
  message: string;
  onBack: () => void;
  onBook: () => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  doctorFee: number;
}

const SlotBooking = React.memo(
  ({ selectedDate, selectedSlot, handleDateChange, slots, setSelectedSlot, loading, bookingLoading, message, onBack, onBook, paymentMethod, setPaymentMethod, doctorFee }: SlotBookingProps) => (
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
      {message && <p className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded">{message}</p>}
      {loading && (
        <div className="mt-4 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Loading slots...</p>
        </div>
      )}
      {!loading && slots.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots.map((slot: Slot, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(slot)}
              disabled={slot.is_booked}
              className={`px-4 py-2 rounded-lg border text-sm ${slot.is_booked
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

      {/* Payment method selection */}
      {selectedSlot && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Select Payment Method:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="counter" checked={paymentMethod === "counter"} onChange={(e) => setPaymentMethod(e.target.value)} />
              Pay at Counter
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="online" checked={paymentMethod === "online"} onChange={(e) => setPaymentMethod(e.target.value)} />
              Pay Online (₹{doctorFee})
            </label>
          </div>
        </div>
      )}

      <NavigationButtons
        back={onBack}
        next={onBook}
        nextLabel={bookingLoading ? "Processing..." : "Book Appointment"}
        disableNext={!selectedSlot || bookingLoading}
      />
    </div>
  )
);

interface SuccessPageProps {
  successMsg: string;
}

const SuccessPage = React.memo(({ successMsg }: SuccessPageProps) => (
  <div className="text-center mt-20">
    <h2 className="text-2xl font-bold text-green-600 mb-2">Appointment Confirmed 🎉</h2>
    <p className="text-gray-600">{successMsg}</p>
    <p className="text-sm text-gray-500 mt-2">Redirecting to homepage...</p>
  </div>
));

// -------- Shared Components --------
interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const Input = ({ label, name, value, onChange, type = "text", required = false }: InputProps) => (
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

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({ label, name, value, onChange }: TextAreaProps) => (
  <div className="w-full max-w-xs sm:max-w-full font-mono">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="text-sm custom-input w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-gray-100"
      placeholder={`Enter ${label.toLowerCase()} here`}
    />
  </div>
);

interface NavigationButtonsProps {
  back?: () => void;
  next: () => void;
  nextLabel?: string;
  disableNext?: boolean;
}

const NavigationButtons = ({ back, next, nextLabel = "Continue", disableNext = false }: NavigationButtonsProps) => (
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
        ${disableNext
          ? "opacity-50 cursor-not-allowed bg-gray-500"
          : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]"
        }`}
    >
      {nextLabel}
    </button>
  </div>
);

export default MultiStepSlotBooking;