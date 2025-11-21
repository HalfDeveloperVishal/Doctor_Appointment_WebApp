import { HeartPulse } from 'lucide-react';

const specialties = [
  'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Radiology', 'Oncology',
  'Gynecology', 'Endocrinology', 'Gastroenterology', 'Ophthalmology'
];

const FindSpecialists = () => {
  return (
    <section className="py-20 px-4 bg-[var(--color-background)] text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] mb-4 font-[var(--font-heading)]">Find Specialists</h2>
      <p className="text-[var(--color-text-muted)] mb-12 text-lg max-w-2xl mx-auto">
        Browse our network of verified healthcare professionals across all specialties to find the right care for you.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
        {specialties.map((spec, index) => (
          <div
            key={index}
            className="bg-[var(--color-surface)] border border-gray-100 rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="bg-teal-50 p-4 rounded-full mb-4 group-hover:bg-[var(--color-primary)] transition-colors duration-300">
              <HeartPulse className="text-[var(--color-primary)] w-6 h-6 group-hover:text-white transition-colors duration-300" />
            </div>
            <p className="font-semibold text-[var(--color-text-main)] text-sm md:text-base">{spec}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FindSpecialists;
