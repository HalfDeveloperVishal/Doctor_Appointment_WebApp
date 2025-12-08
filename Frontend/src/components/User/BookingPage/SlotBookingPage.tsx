import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../HomePage/Navbar";
import ProgressBar from "./components/ProgressBar";
import PersonalInfo from "./components/PersonalInfo";
import MedicalInfo from "./components/MedicalInfo";
import SlotBooking from "./components/SlotBooking";
import SuccessPage from "./components/SuccessPage";
import { useBookingForm } from "./hooks/useBookingForm";
import { useSlotBooking } from "./hooks/useSlotBooking";
import { usePayment } from "./hooks/usePayment";
import { loadRazorpayScript } from "./utils/razorpay.utils";

const MultiStepSlotBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Custom hooks
  const { formData, handleChange } = useBookingForm();
  const {
    loading,
    message,
    setMessage,
    slots,
    selectedDate,
    selectedSlot,
    setSelectedSlot,
    doctorFee,
    handleDateChange,
  } = useSlotBooking(id);

  const { paymentMethod, setPaymentMethod, bookingLoading, handleBooking } = usePayment({
    doctorId: id,
    selectedDate,
    selectedSlot,
    formData,
    doctorFee,
    setMessage,
    setSuccessMsg,
    setStep,
  });

  // Load Razorpay script on component mount
  useEffect(() => {
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
          <ProgressBar currentStep={step} />

          {/* Step Components */}
          {step === 1 && <PersonalInfo formData={formData} handleChange={handleChange} onNext={() => setStep(2)} />}
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

export default MultiStepSlotBooking;
