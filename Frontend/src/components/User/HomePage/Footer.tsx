import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo and Description */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[var(--color-primary)] text-white font-bold text-xl rounded-xl px-2 py-1">
              H+
            </div>
            <h1 className="text-xl font-bold text-white font-[var(--font-heading)]">MedConnect</h1>
          </div>
          <p className="text-sm leading-7 text-gray-400">
            Your trusted partner for quality healthcare services and professional medical consultations. Connecting you with the best doctors.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-5 font-[var(--font-heading)]">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Find Doctors</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Specialties</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-bold mb-5 font-[var(--font-heading)]">Support</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold mb-5 font-[var(--font-heading)]">Contact Info</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-[var(--color-primary)]" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-[var(--color-primary)]" />
              <span>support@medconnect.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-[var(--color-primary)]" />
              <span>123 Health St, Medical City</span>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-800 mt-12 mb-8 mx-6" />

      <p className="text-center text-sm text-gray-500">
        © 2024 MedConnect. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
