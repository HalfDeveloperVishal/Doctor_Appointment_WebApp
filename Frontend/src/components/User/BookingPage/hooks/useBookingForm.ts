import { useState, ChangeEvent } from "react";
import { BookingFormData } from "../types/booking.types";

export const useBookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    reason: "",
    symptoms: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    handleChange,
  };
};
