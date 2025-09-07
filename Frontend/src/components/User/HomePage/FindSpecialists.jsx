import React from 'react';
import { HeartPulse } from 'lucide-react'; // icon

const specialties = [
  'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Radiology', 'Oncology',
  'Gynecology', 'Endocrinology', 'Gastroenterology', 'Ophthalmology'
];

const FindSpecialists = () => {
  return (
    <section className="py-16 px-4 bg-white text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Find Specialists</h2>
      <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
        Browse our network of verified healthcare professionals across all specialties
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
        {specialties.map((spec, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200  rounded-xl p-6 flex flex-col items-center shadow-sm transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="bg-teal-100 p-3 rounded-xl mb-4">
              <HeartPulse className="text-teal-600 w-6 h-6" />
            </div>
            <p className="font-medium text-gray-900">{spec}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FindSpecialists;
