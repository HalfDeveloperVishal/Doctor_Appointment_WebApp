import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../HomePage/Navbar";
import Chatbot from "../../Chatbot/Chatbot";

// ============================================
// INTERFACES
// ============================================
interface PatientInfo {
  full_name?: string;
  reason_to_visit?: string;
  symptoms_or_concerns?: string;
}

interface Appointment {
  id: number;
  doctor_name: string;
  specialization: string;
  clinic_name: string;
  address: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  payment_method: "online" | "counter";
  is_rejected: boolean;
  patient_info?: PatientInfo;
}

type SortKey = "date" | "patient_name" | "created_at";

interface SortConfig {
  key: SortKey | null;
  direction: "asc" | "desc";
}

// ============================================
// MAIN COMPONENT
// ============================================
const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showToday, setShowToday] = useState<boolean>(true);
  const [showUpcoming, setShowUpcoming] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get<Appointment[]>(
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
            <TableSection appointments={todaysAppointments} />
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
            <TableSection appointments={upcomingAppointments} />
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

// ============================================
// TABLE SECTION COMPONENT
// ============================================
interface TableSectionProps {
  appointments: Appointment[];
}

const TableSection = ({ appointments }: TableSectionProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  if (!appointments.length) return null;

  // ---------- SORTING LOGIC ----------
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const key = sortConfig.key;

    let valA: string | Date;
    let valB: string | Date;

    if (key === "patient_name") {
      valA = a.patient_info?.full_name || "";
      valB = b.patient_info?.full_name || "";
    } else {
      valA = a[key];
      valB = b[key];
    }

    // convert date fields
    if (key === "date" || key === "created_at") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Handle click on sortable column
  const handleSort = (key: SortKey): void => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sorting icon helper
  const sortIcon = (key: SortKey): string => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // ---------- STATUS BADGE ----------
  const getStatusBadge = (isRejected: boolean): string => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    return isRejected
      ? base + " bg-red-100 text-red-700"
      : base + " bg-green-100 text-green-700";
  };

  const getStatusText = (appointment: Appointment): string =>
    appointment.is_rejected ? "Rejected" : "Accepted";

  // ---------- PAYMENT METHOD BADGE ----------
  const getPaymentMethodBadge = (paymentMethod: string): string => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    return paymentMethod === "online"
      ? base + " bg-blue-100 text-blue-700"
      : base + " bg-purple-100 text-purple-700";
  };

  const getPaymentMethodText = (method: string): string => {
    return method === "online" ? "Paid Online" : "Pay at Counter";
  };

  const formatDateTime = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) return "N/A";

    const dateObj = new Date(dateTimeString);

    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${date} (${time})`;
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

            {/* SORTABLE DATE COLUMN */}
            <th
              className="border p-3 cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date {sortIcon("date")}
            </th>

            <th className="border p-3">Slot</th>

            {/* SORTABLE PATIENT NAME */}
            <th
              className="border p-3 cursor-pointer"
              onClick={() => handleSort("patient_name")}
            >
              Patient Name {sortIcon("patient_name")}
            </th>

            <th className="border p-3">Reason</th>
            <th className="border p-3">Symptoms</th>

            {/* SORTABLE BOOKED ON */}
            <th
              className="border p-3 cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              Booked On {sortIcon("created_at")}
            </th>

            <th className="border p-3">Payment Method</th>
            <th className="border p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {sortedAppointments.map((a) => {
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
                <td className="border p-3">{info.full_name || "N/A"}</td>
                <td className="border p-3">{info.reason_to_visit || "N/A"}</td>
                <td className="border p-3">{info.symptoms_or_concerns || "N/A"}</td>
                <td className="border p-3">{formatDateTime(a.created_at)}</td>

                <td className="border p-3">
                  <span className={getPaymentMethodBadge(a.payment_method)}>
                    {getPaymentMethodText(a.payment_method)}
                  </span>
                </td>

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