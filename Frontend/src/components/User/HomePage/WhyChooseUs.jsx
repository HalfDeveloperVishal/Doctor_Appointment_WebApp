import React from "react";
import { ShieldCheck, Clock, HeartPulse, Users } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: "Verified Doctors",
    description: "All healthcare professionals are verified and board-certified",
  },
  {
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    title: "Instant Booking",
    description: "Book appointments 24/7 with real-time availability",
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-blue-600" />,
    title: "24/7 Support",
    description: "Round-the-clock customer support for all your needs",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "500+ Doctors",
    description: "Choose from hundreds of specialists across all fields",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-white py-14 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Choose Us?
        </h2>
        <p className="text-gray-600 text-lg mb-12">
          We make healthcare accessible and convenient with our <br className="hidden md:block" />
          comprehensive platform features
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
