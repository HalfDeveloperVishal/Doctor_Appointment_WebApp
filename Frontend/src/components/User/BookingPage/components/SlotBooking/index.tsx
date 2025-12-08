import React, { Dispatch, SetStateAction } from "react";
import DateSelector from "./DateSelector";
import SlotGrid from "./SlotGrid";
import PaymentMethodSelector from "./PaymentMethodSelector";
import NavigationButtons from "../shared/NavigationButtons";
import { Slot } from "../../types/booking.types";

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
  ({
    selectedDate,
    selectedSlot,
    handleDateChange,
    slots,
    setSelectedSlot,
    loading,
    bookingLoading,
    message,
    onBack,
    onBook,
    paymentMethod,
    setPaymentMethod,
    doctorFee,
  }: SlotBookingProps) => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Select Appointment Slot</h2>
      
      <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
      
      {message && <p className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded">{message}</p>}
      
      <SlotGrid slots={slots} selectedSlot={selectedSlot} onSlotSelect={setSelectedSlot} loading={loading} />

      {selectedSlot && (
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          doctorFee={doctorFee}
        />
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

export default SlotBooking;
