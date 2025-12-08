import { useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BookingFormData, Slot, RazorpayOptions, RazorpayResponse, RazorpayError } from "../types/booking.types";

interface UsePaymentProps {
  doctorId: string | undefined;
  selectedDate: Date | null;
  selectedSlot: Slot | null;
  formData: BookingFormData;
  doctorFee: number;
  setMessage: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
  setStep: (step: number) => void;
}

export const usePayment = ({
  doctorId,
  selectedDate,
  selectedSlot,
  formData,
  doctorFee,
  setMessage,
  setSuccessMsg,
  setStep,
}: UsePaymentProps) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("counter");
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setMessage("Please select date and slot");
      return;
    }

    setMessage("");
    setSuccessMsg("");

    const bookingRequestPayload = {
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

      // First call BookSlot endpoint
      const bookRes = await axios.post(
        `http://localhost:8000/patient/${doctorId}/book_slot/`,
        bookingRequestPayload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );

      // Counter payment flow
      if (paymentMethod === "counter" && bookRes.data?.id) {
        setBookingLoading(false);
        const startTime = selectedSlot.start_time;
        const endTime = selectedSlot.end_time;
        setSuccessMsg(`Appointment booked successfully for ${startTime} - ${endTime}`);
        setStep(4);
        setTimeout(() => navigate("/"), 4000);
        return;
      }

      // Online payment flow
      if (paymentMethod === "online") {
        const bookingData = bookRes.data;

        // Create Razorpay Order
        const orderRes = await axios.post(
          "http://localhost:8000/patient/create_payment_order/",
          {
            ...bookingData,
            amount: doctorFee,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          }
        );

        const { order_id, amount: r_amount, currency, razorpay_key, booking_data } = orderRes.data;

        setBookingLoading(false);

        if (!window.Razorpay) {
          setMessage("Payment gateway not loaded. Please refresh and try again.");
          return;
        }

        // Razorpay options
        const options: RazorpayOptions = {
          key: razorpay_key,
          amount: r_amount,
          currency: currency,
          order_id: order_id,
          name: "Doctor Appointment",
          description: "Appointment Payment",
          handler: async function (response: RazorpayResponse) {
            try {
              setBookingLoading(true);

              const bookingPayloadToVerify = booking_data || bookingData;

              await axios.post(
                "http://localhost:8000/patient/verify_payment/",
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  ...bookingPayloadToVerify,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
              );

              setBookingLoading(false);
              const startTime = selectedSlot.start_time;
              const endTime = selectedSlot.end_time;
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
            },
          },
        };

        // Open Razorpay modal
        try {
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (response: RazorpayError) {
            console.error("Payment failed:", response.error);
            setMessage(`Payment failed: ${response.error.description}`);
          });
          rzp.open();
        } catch (err) {
          console.error("Error opening Razorpay:", err);
          setMessage("Unable to open payment gateway. Try again later.");
        }

        return;
      }

      // Fallback
      setBookingLoading(false);
      setMessage("Unexpected response from server.");
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

  return {
    paymentMethod,
    setPaymentMethod,
    bookingLoading,
    handleBooking,
  };
};
