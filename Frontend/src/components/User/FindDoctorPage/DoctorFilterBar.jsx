import React, { useEffect, useState } from "react";

export default function DoctorFilterBar({ specialty, setSpecialty }) {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    // You can fetch this dynamically from API if needed
    setSpecialties([
      "All Specialties",
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Orthopedics",
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-3">
      {/* Specialties dropdown */}
      <select
        className="border border-gray-300 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500 flex-1"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
      >
        {specialties.map((spec) => (
          <option key={spec}>{spec}</option>
        ))}
      </select>
    </div>
  );
}
