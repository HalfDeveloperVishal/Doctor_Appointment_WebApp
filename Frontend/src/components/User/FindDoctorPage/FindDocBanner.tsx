
export default function FindDoctorBanner() {
  return (
    <div className="py-16 bg-[var(--color-surface)]">
      <div className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] py-16 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
          Find Your Doctor
        </h1>
        <p className="text-lg text-white max-w-2xl mx-auto p-2 font-medium">
          Browse through our network of verified healthcare professionals and book your
          appointment today.
        </p>
      </div>
    </div>
  );
}
