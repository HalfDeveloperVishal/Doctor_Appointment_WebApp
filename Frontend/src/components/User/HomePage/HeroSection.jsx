import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Your Health, Our <span className="text-blue-600">Priority</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Book appointments with verified doctors instantly. Get quality<br />
          healthcare at your convenience.
        </p>
        
        <div className="mt-8 max-w-xl mx-auto">
          {/* Desktop version (button on right) */}
          <div className="hidden sm:block relative">
            <input
              type="text"
              placeholder="Search doctors, specialties, or locations..."
              className="w-full px-5 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Search Doctors
            </button>
          </div>
          
          {/* Mobile version (button below) */}
          <div className="sm:hidden space-y-2">
            <input
              type="text"
              placeholder="Search doctors, specialties, or locations..."
              className="w-full px-5 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Search Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;