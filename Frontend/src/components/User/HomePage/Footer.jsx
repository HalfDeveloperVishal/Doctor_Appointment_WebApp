import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1E293B] text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 text-white font-bold text-xl rounded-xl px-2 py-1">
              H+
            </div>
            <h1 className="text-xl font-semibold text-white">HealthCare</h1>
          </div>
          <p className="text-sm leading-6">
            Your trusted partner for quality healthcare services and professional medical consultations.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Find Doctors</a></li>
            <li><a href="#" className="hover:underline">Specialties</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Help Center</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} /> +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@healthcare.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> 123 Health St, Medical City
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-700 mt-8 mb-4 mx-6" />

      <p className="text-center text-sm text-gray-400">
        © 2024 HealthCare. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
