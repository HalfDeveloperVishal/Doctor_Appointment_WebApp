// PatientAppointmentsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../HomePage/Navbar";
import Chatbot from "../../Chatbot/Chatbot";

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showToday, setShowToday] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/patient/patient-appointment/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ---- SEARCH FILTER ----
  const filteredAppointments = appointments.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      a.doctor_name?.toLowerCase().includes(search) ||
      a.specialization?.toLowerCase().includes(search) ||
      a.clinic_name?.toLowerCase().includes(search) ||
      a.address?.toLowerCase().includes(search)
    );
  });

  // ---- CATEGORIZE ----
  const todaysAppointments = filteredAppointments.filter(
    (a) => new Date(a.date).toISOString().split("T")[0] === todayStr
  );

  const upcomingAppointments = filteredAppointments.filter(
    (a) => new Date(a.date).toISOString().split("T")[0] > todayStr
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Search Box */}
        <div className="mb-6 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Search by doctor, specialization, clinic, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* ---------------- TODAY'S APPOINTMENTS ---------------- */}
        <div className="mb-6 bg-white rounded-lg border shadow-sm">
          <button
            onClick={() => setShowToday(!showToday)}
            className="w-full flex justify-between px-5 py-3 text-lg font-semibold bg-gray-100 hover:bg-gray-200"
          >
            <span>Today's Appointments ({todaysAppointments.length})</span>
            <span>{showToday ? "▲" : "▼"}</span>
          </button>

          {showToday && (
            <TableSection appointments={todaysAppointments} type="today" />
          )}

          {showToday && todaysAppointments.length === 0 && (
            <p className="px-5 py-3 text-gray-500">No appointments today.</p>
          )}
        </div>

        {/* ---------------- UPCOMING APPOINTMENTS ---------------- */}
        <div className="mb-6 bg-white rounded-lg border shadow-sm">
          <button
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="w-full flex justify-between px-5 py-3 text-lg font-semibold bg-gray-100 hover:bg-gray-200"
          >
            <span>Upcoming Appointments ({upcomingAppointments.length})</span>
            <span>{showUpcoming ? "▲" : "▼"}</span>
          </button>

          {showUpcoming && (
            <TableSection
              appointments={upcomingAppointments}
              type="upcoming"
            />
          )}

          {showUpcoming && upcomingAppointments.length === 0 && (
            <p className="px-5 py-3 text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-5 right-5 z-50">
        <Chatbot />
      </div>
    </>
  );
};

export default PatientAppointmentsPage;

/* ===================================================================
   TABLE SECTION COMPONENT
=================================================================== */
/* ===================================================================
   TABLE SECTION COMPONENT (UPDATED WITH STATUS)
=================================================================== */
const TableSection = ({ appointments }) => {
  if (!appointments.length) return null;

  // Badge styling
  const getStatusBadge = (isRejected) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";

    if (isRejected) {
      return base + " bg-red-100 text-red-700"; // rejected
    }
    return base + " bg-green-100 text-green-700"; // accepted
  };

  const getStatusText = (a) => {
    if (a.is_rejected) return "Rejected";

    // if doctor's review is pending you can change here
    return "Accepted";
  };

  return (
    <div className="overflow-x-auto px-5 py-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-3">Doctor</th>
            <th className="border p-3">Specialization</th>
            <th className="border p-3">Clinic</th>
            <th className="border p-3">Address</th>
            <th className="border p-3">Date</th>
            <th className="border p-3">Slot</th>
            <th className="border p-3">Reason</th>
            <th className="border p-3">Symptoms</th>
            <th className="border p-3">Doctor Email</th>
            <th className="border p-3">Booked On</th>
            <th className="border p-3">Status</th> {/* NEW */}
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => {
            const info = a.patient_info || {};

            return (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="border p-3 font-semibold">Dr. {a.doctor_name}</td>
                <td className="border p-3">{a.specialization}</td>
                <td className="border p-3">{a.clinic_name}</td>
                <td className="border p-3">{a.address}</td>
                <td className="border p-3">{a.date}</td>

                <td className="border p-3">
                  {a.start_time} – {a.end_time}
                </td>

                <td className="border p-3">{info.reason_to_visit || "N/A"}</td>
                <td className="border p-3">{info.symptoms_or_concerns || "N/A"}</td>

                <td className="border p-3">{a.doctor_email || "N/A"}</td>
                <td className="border p-3">{a.created_at}</td>

                {/* STATUS COLUMN */}
                <td className="border p-3">
                  <span className={getStatusBadge(a.is_rejected)}>
                    {getStatusText(a)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
