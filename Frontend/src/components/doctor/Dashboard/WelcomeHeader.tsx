import { useEffect, useState } from 'react';

export default function WelcomeHeader() {
  const [doctorName, setDoctorName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState('');

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/doctor/doctor_profile/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctor profile");
        }

        const data = await response.json();
        setDoctorName(data.full_name || "Doctor");
        setAvatarSrc(data.profile_photo_url || "");
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    fetchDoctorProfile();
  }, []);

  // Generate initials from doctor name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex flex-col items-start justify-between gap-4 rounded-xl mt-8 bg-white/70 p-4 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm md:flex-row md:items-center md:p-5">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative inline-flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-blue-500/20">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${doctorName} profile photo`}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white font-semibold">
              {getInitials(doctorName)}
            </div>
          )}
        </div>

        {/* Text Content */}
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight text-gray-900">
            Welcome, {doctorName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm text-gray-600">Here's a quick overview of your day.</p>
        </div>
      </div>
    </header>
  );
}