import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "MediBook made it so easy to find and book with the right specialist. The platform is intuitive and saved me hours of calling different clinics.",
  },
  {
    name: "David Chen",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    text: "Excellent service! I was able to book an appointment with a cardiologist the same day. The doctor was professional and the whole experience was seamless.",
  },
  {
    name: "Maria Rodriguez",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "The appointment reminders and follow-up care coordination through MediBook have been game-changing for managing my family’s healthcare.",
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-16 px-4 bg-[#f9fafb] text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Patients Say</h2>
      <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
        Trusted by thousands of patients for quality healthcare booking
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition duration-300"
          >
            <div className="flex gap-1 mb-4 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-700 text-base mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
