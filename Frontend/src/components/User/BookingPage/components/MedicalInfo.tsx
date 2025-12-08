import React, { ChangeEvent } from "react";
import TextArea from "./shared/TextArea";
import NavigationButtons from "./shared/NavigationButtons";
import { BookingFormData } from "../types/booking.types";

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

export default MedicalInfo;
