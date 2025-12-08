import { Slot } from "../../types/booking.types";

interface SlotGridProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
  loading: boolean;
}

const SlotGrid = ({ slots, selectedSlot, onSlotSelect, loading }: SlotGridProps) => {
  if (loading) {
    return (
      <div className="mt-4 flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading slots...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((slot: Slot, i: number) => (
        <button
          key={i}
          onClick={() => onSlotSelect(slot)}
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
  );
};

export default SlotGrid;
