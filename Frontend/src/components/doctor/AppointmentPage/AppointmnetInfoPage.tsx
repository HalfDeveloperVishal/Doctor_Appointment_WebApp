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

// Tab Types for the new UI
type TabType = "Upcoming" | "Past" | "Cancelled";

const DoctorBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");

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

  // Filter by Search Term
  const filteredBookings = bookings.filter((booking) => {
    const patient = booking.patient_info || {} as PatientInfo;
    const fullName = patient.full_name || booking.patient_full_name || "";
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter by Tab Status
  const getTabStatus = (booking: Booking): TabType => {
    const date = new Date(booking.date).toISOString().split("T")[0];
    if (booking.is_rejected) return "Cancelled";
    if (date === todayStr) return "Upcoming";
    if (date > todayStr) return "Upcoming";
    return "Past";
  };

  const tabFilteredBookings = filteredBookings.filter((booking) => {
    return getTabStatus(booking) === activeTab;
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

  // Placeholder actions for new buttons
  const handleCancel = (id: number) => {
    handleReject(id); // Reusing reject logic for Cancel
  };
  // const handleReschedule = (id: number) => {
  //   alert(`Reschedule appointment ${id} - Implement logic`);
  // };
  const handleViewSummary = (id: number) => {
    alert(`View summary for appointment ${id} - Implement logic`);
  };

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Search Bar */}
      <div className="mb-6 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search by patient name..."
          className="w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MY APPOINTMENTS SECTION */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all your past and future appointments.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {(["Upcoming", "Past", "Cancelled"] as TabType[]).map((tab) => {
            const count = tabFilteredBookings.filter((b) => getTabStatus(b) === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold transition-colors flex items-center space-x-2 ${
                  activeTab === tab
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{tab}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wide">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tabFilteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No appointments in this category.</p>
                    </div>
                  </td>
                </tr>
              )}

              {tabFilteredBookings.map((booking) => {
                const p = booking.patient_info || {} as PatientInfo;
                const fullName = p.full_name || booking.patient_full_name || "Unknown";
                const phone = p.phone_number || "N/A";
                const email = p.email || "N/A";
                const reason = p.reason_to_visit || "No reason provided";
                const status = getTabStatus(booking);

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    {/* Patient Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{fullName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{phone}</span>
                    </td>

                    {/* Email Column */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{email}</span>
                    </td>

                    {/* Reason Column */}
                    <td className="px-4 py-3">
                      <span className="text-gray-600 text-sm truncate max-w-[150px] block" title={reason}>
                        {reason}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">
                        {new Date(booking.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Time Column */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">
                        {booking.start_time} – {booking.end_time}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      {status === "Upcoming" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          Upcoming
                        </span>
                      )}
                      {status === "Past" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Completed
                        </span>
                      )}
                      {status === "Cancelled" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3">
                      <div className="flex space-x-1.5">
                        {status === "Upcoming" && (
                          <>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="bg-gray-100 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors"
                              title="Cancel Appointment"
                            >
                              Cancel
                            </button>
                            {/* <button
                              onClick={() => handleReschedule(booking.id)}
                              className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
                              title="Reschedule Appointment"
                            >
                              Reschedule
                            </button> */}
                          </>
                        )}
                        {status === "Past" && (
                          <button
                            onClick={() => handleViewSummary(booking.id)}
                            className="bg-gray-100 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors"
                            title="View Summary"
                          >
                            View Summary
                          </button>
                        )}
                        {status === "Cancelled" && (
                          <span className="text-gray-400 text-xs italic">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorBookingsPage;