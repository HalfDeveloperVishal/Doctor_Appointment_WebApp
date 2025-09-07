import React from "react";

export default function FindDoctorBanner() {
  return (
    <div className=" py-16"> 
        <div className="w-full bg-gradient-to-r from-blue-600 to-teal-400 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
            Find Your Doctor
        </h1>
        <p className="text-lg text-white max-w-2xl mx-auto p-2">
            Browse through our network of verified healthcare professionals and book your
            appointment today.
        </p>
        </div>
    </div>
  );
}
