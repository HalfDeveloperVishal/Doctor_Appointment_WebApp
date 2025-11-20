import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[var(--color-background)] via-teal-50 to-blue-50 py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-main)] mb-6 font-[var(--font-heading)] leading-tight">
          Your Health, Our <span className="text-[var(--color-primary)]">Priority</span>
        </h1>
        <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Book appointments with verified doctors instantly. Get quality
          healthcare at your convenience with our trusted network of specialists.
        </p>

        <div className="mt-8 max-w-2xl mx-auto">
          {/* Desktop version (button on right) */}
          <div className="hidden sm:block relative shadow-lg rounded-xl">
            <input
              type="text"
              placeholder="Search doctors, specialties, or locations..."
              className="w-full px-6 py-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] text-gray-700 text-lg placeholder-gray-400"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] font-medium transition-all shadow-md hover:shadow-lg">
              Search
            </button>
          </div>

          {/* Mobile version (button below) */}
          <div className="sm:hidden space-y-3">
            <input
              type="text"
              placeholder="Search doctors..."
              className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent shadow-sm"
            />
            <button className="w-full bg-[var(--color-primary)] text-white px-4 py-3 rounded-xl hover:bg-[var(--color-primary-hover)] focus:outline-none font-medium shadow-md transition-colors">
              Search Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;