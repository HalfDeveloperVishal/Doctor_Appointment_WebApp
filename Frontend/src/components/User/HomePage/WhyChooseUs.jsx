import React from "react";
import { ShieldCheck, Clock, HeartPulse, Users } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[var(--color-primary)]" />,
    title: "Verified Doctors",
    description: "All healthcare professionals are verified and board-certified",
  },
  {
    icon: <Clock className="w-6 h-6 text-[var(--color-primary)]" />,
    title: "Instant Booking",
    description: "Book appointments 24/7 with real-time availability",
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-[var(--color-primary)]" />,
    title: "24/7 Support",
    description: "Round-the-clock customer support for all your needs",
  },
  {
    icon: <Users className="w-6 h-6 text-[var(--color-primary)]" />,
    title: "500+ Doctors",
    description: "Choose from hundreds of specialists across all fields",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-[var(--color-surface)] py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] mb-4 font-[var(--font-heading)]">
          Why Choose Us?
        </h2>
        <p className="text-[var(--color-text-muted)] text-lg mb-12 max-w-2xl mx-auto">
          We make healthcare accessible and convenient with our comprehensive platform features designed for your peace of mind.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out group"
            >
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-6 bg-teal-50 rounded-xl group-hover:bg-[var(--color-primary)] transition-colors duration-300">
                {React.cloneElement(feature.icon, { className: "w-7 h-7 text-[var(--color-primary)] group-hover:text-white transition-colors duration-300" })}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
