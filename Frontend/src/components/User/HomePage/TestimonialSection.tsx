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
    <section className="py-20 px-4 bg-[var(--color-background)] text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] mb-4 font-[var(--font-heading)]">What Our Patients Say</h2>
      <p className="text-[var(--color-text-muted)] mb-12 text-lg max-w-2xl mx-auto">
        Trusted by thousands of patients for quality healthcare booking and management.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] border border-gray-100 rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex gap-1 mb-6 text-[var(--color-accent)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <p className="text-[var(--color-text-main)] text-base mb-8 leading-relaxed italic">"{t.text}"</p>
            <div className="flex items-center gap-4">
              <img
                src={t.image}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <p className="font-bold text-[var(--color-text-main)]">{t.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
