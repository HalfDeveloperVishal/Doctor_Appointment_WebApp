import React, { ChangeEvent } from "react";
import Input from "./shared/Input";
import NavigationButtons from "./shared/NavigationButtons";
import { BookingFormData } from "../types/booking.types";

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

export default PersonalInfo;
