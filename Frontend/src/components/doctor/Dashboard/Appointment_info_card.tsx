import { useEffect, useState } from "react";

interface Stats {
  total_appointments: number;
  upcoming_appointments: number;
  total_patients_seen: number;
  average_rating: number;
}

export const Appointment_info_card = () => {
  const [stats, setStats] = useState<Stats>({
    total_appointments: 0,
    upcoming_appointments: 0,
    total_patients_seen: 0,
    average_rating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8000/doctor/appointment-stats/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch appointment stats");

        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching appointment stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Total Appointments", number: stats.total_appointments, color: "bg-blue-500" },
    { title: "Upcoming Appointments", number: stats.upcoming_appointments, color: "bg-green-500" },
    { title: "Total Patients Seen", number: stats.total_patients_seen, color: "bg-yellow-500" },
    { title: "Average Rating", number: stats.average_rating, color: "bg-red-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="w-68 h-44 rounded-xl overflow-hidden cursor-pointer shadow-lg grid grid-rows-[50px_1fr] font-sans text-white"
          >
            <div
              className={`flex items-center justify-center ${card.color} transition-transform duration-200 transform`}
            ></div>

            <div className="bg-gray-800 p-4 rounded-b-xl grid gap-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-l">{card.title}</div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                </div>
              </div>
              <div className="text-2xl font-semibold">{card.number}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
