// DoctorBookingsPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface PatientInfo {
  full_name: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string;
  reason_to_visit?: string;
  symptoms_or_concerns?: string;
}

interface Booking {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_rejected: boolean;
  patient_full_name?: string;
  patient_info?: PatientInfo;
}

const DoctorBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showToday, setShowToday] = useState<boolean>(true);
  const [showUpcoming, setShowUpcoming] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/doctor/booking-info/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setBookings(res.data);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const patient = booking.patient_info || {} as PatientInfo;
    const fullName = patient.full_name || booking.patient_full_name || "";
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const todaysBookings = filteredBookings.filter((booking) => {
    const date = new Date(booking.date).toISOString().split("T")[0];
    return date === todayStr;
  });

  const upcomingBookings = filteredBookings.filter((booking) => {
    const date = new Date(booking.date).toISOString().split("T")[0];
    return date > todayStr;
  });

  const handleReject = async (bookingId: number) => {
    const reason = prompt("Enter rejection reason (optional):") || "";

    try {
      const res = await axios.post(
        `http://localhost:8000/patient/booking/${bookingId}/reject/`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.data : b))
      );

      alert("Booking rejected successfully");
    } catch {
      alert("Failed to reject booking.");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Search Bar */}
      <div className="mb-6 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search by patient name..."
          className="w-full text-gray-700 placeholder-gray-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TODAY'S APPOINTMENTS */}
      <div className="mb-6 bg-white shadow-sm border rounded-lg">
        <button
          onClick={() => setShowToday(!showToday)}
          className="w-full flex justify-between px-5 py-3 text-lg font-semibold bg-gray-100 hover:bg-gray-200"
        >
          <span>Today's Appointments ({todaysBookings.length})</span>
          <span>{showToday ? "▲" : "▼"}</span>
        </button>

        {showToday && todaysBookings.length > 0 && (
          <TableSection bookings={todaysBookings} handleReject={handleReject} />
        )}

        {showToday && todaysBookings.length === 0 && (
          <p className="px-5 py-3 text-gray-500">No appointments today.</p>
        )}
      </div>

      {/* UPCOMING APPOINTMENTS */}
      <div className="mb-6 bg-white shadow-sm border rounded-lg">
        <button
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="w-full flex justify-between px-5 py-3 text-lg font-semibold bg-gray-100 hover:bg-gray-200"
        >
          <span>Upcoming Appointments ({upcomingBookings.length})</span>
          <span>{showUpcoming ? "▲" : "▼"}</span>
        </button>

        {showUpcoming && upcomingBookings.length > 0 && (
          <TableSection bookings={upcomingBookings} handleReject={handleReject} />
        )}

        {showUpcoming && upcomingBookings.length === 0 && (
          <p className="px-5 py-3 text-gray-500">No upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorBookingsPage;

interface TableSectionProps {
  bookings: Booking[];
  handleReject: (id: number) => void;
}

interface SortConfig {
  key: "date" | null;
  direction: "asc" | "desc";
}

const TableSection: React.FC<TableSectionProps> = ({ bookings, handleReject }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // ---- SORTING LOGIC FOR DATE ONLY ----
  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortConfig.key !== "date") return 0;

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA < dateB) return sortConfig.direction === "asc" ? -1 : 1;
    if (dateA > dateB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = () => {
    setSortConfig((prev) => ({
      key: "date",
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIcon = () =>
    sortConfig.direction === "asc" ? "▲" : "▼";

  return (
    <div className="overflow-x-auto px-5 py-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Patient Name</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">DOB</th>
            <th className="p-3 border">Reason</th>
            <th className="p-3 border">Symptoms</th>

            {/* SORTABLE DATE COLUMN */}
            <th
              className="p-3 border cursor-pointer"
              onClick={handleSort}
            >
              Date {sortIcon()}
            </th>

            <th className="p-3 border">Time</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {sortedBookings.map((booking) => {
            const p = booking.patient_info || {} as PatientInfo;

            return (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="p-3 border font-semibold">
                  {p.full_name || booking.patient_full_name}
                </td>

                <td className="p-3 border">{p.phone_number || "N/A"}</td>
                <td className="p-3 border">{p.email || "N/A"}</td>
                <td className="p-3 border">{p.date_of_birth || "N/A"}</td>
                <td className="p-3 border">{p.reason_to_visit || "N/A"}</td>
                <td className="p-3 border">{p.symptoms_or_concerns || "N/A"}</td>

                {/* SORTABLE DATE */}
                <td className="p-3 border">{booking.date}</td>

                <td className="p-3 border">
                  {booking.start_time} – {booking.end_time}
                </td>

                <td className="p-3 border">
                  {booking.is_rejected ? (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Accepted</span>
                  )}
                </td>

                <td className="p-3 border">
                  {!booking.is_rejected && (
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
