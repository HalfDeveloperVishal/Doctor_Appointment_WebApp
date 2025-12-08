import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Slot } from "../types/booking.types";

export const useSlotBooking = (doctorId: string | undefined) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [doctorFee, setDoctorFee] = useState<number>(0);

  // Fetch doctor fee
  useEffect(() => {
    const fetchDoctorFee = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/doctor/${doctorId}/details/`);
        setDoctorFee(res.data.consultation_fee || 0);
      } catch (err) {
        console.error("Error fetching doctor fee:", err);
      }
    };

    if (doctorId) {
      fetchDoctorFee();
    }
  }, [doctorId]);

  // Fetch disabled dates (optional - for future use)
  useEffect(() => {
    const fetchDisabledDates = async () => {
      try {
        const res = await axios.get("http://localhost:8000/doctor/booking-info/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const _bookedDates = res.data
          .filter((b: { patient_id: number }) => b.patient_id === parseInt(localStorage.getItem("user_id") || "0"))
          .map((b: { date: string }) => new Date(b.date));
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
  }, [doctorId, navigate]);

  const fetchSlots = async (date: string): Promise<void> => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        `http://localhost:8000/patient/${doctorId}/available_slots/?date=${date}`,
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

  return {
    loading,
    message,
    setMessage,
    slots,
    selectedDate,
    selectedSlot,
    setSelectedSlot,
    doctorFee,
    handleDateChange,
  };
};
