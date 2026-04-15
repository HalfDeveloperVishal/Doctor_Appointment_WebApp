import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../HomePage/Navbar";
import Chatbot from "../../Chatbot/Chatbot";
import { useNavigate } from "react-router-dom";
import day from "node_modules/react-datepicker/dist/day";

// ================= TYPES =================
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

// ================= MAIN COMPONENT =================
const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate(); // ✅ fixed name

  const handleReschedule = async (
    id: number,
    newDate: string,
    newStart: string,
    newEnd: string
  ) => {
    try {
      await axios.post(
        `http://localhost:8000/patient/reschedule-appointment/${id}/`,
        {
          date: newDate,
          start_time: newStart,
          end_time: newEnd,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, date: newDate, start_time: newStart, end_time: newEnd }
            : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Reschedule failed");
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "cancelled"
  >("upcoming");

  // ================= FETCH =================
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

  // ================= CANCEL LOGIC =================
  const handleCancel = async (id: number) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel?"
    );
    if (!confirmCancel) return;

    try {
      await axios.post(
        `http://localhost:8000/patient/cancel-appointment/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // update UI instantly
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_rejected: true } : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // ================= FILTER =================
  const upcoming = appointments.filter(
    (a) => a.date >= today && !a.is_rejected
  );

  const past = appointments.filter(
    (a) => a.date < today && !a.is_rejected
  );

  const cancelled = appointments.filter((a) => a.is_rejected);

  const getData = () => {
    if (activeTab === "upcoming") return upcoming;
    if (activeTab === "past") return past;
    return cancelled;
  };

  if (loading) return <p className="p-5">Loading...</p>;
  if (error) return <p className="p-5 text-red-500">{error}</p>;

  return (
    <>
      <Navbar />

      <div className="mt-20 max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-gray-500 text-sm">
              View and manage all your appointments.
            </p>
          </div>

          {/* BOOK BUTTON */}
          <button
            onClick={() => navigate("/find-doctor")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
          >
            <span className="text-lg font-bold">+</span>
            Book New Appointment
          </button>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
          {["upcoming", "past", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${activeTab === tab
                ? "bg-white shadow text-blue-600"
                : "text-gray-600"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {getData().length === 0 ? (
            <p className="p-5 text-gray-500">No appointments found.</p>
          ) : (
            <>
              {/* HEADER ROW */}
              <div className="grid grid-cols-[2.2fr_1.2fr_1.5fr_1fr_1.5fr] bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 border-b">
                <div>DOCTOR</div>
                <div>DATE</div>
                <div>TIME</div>
                <div>STATUS</div>
                <div className="text-right">ACTIONS</div>
              </div>

              {/* APPOINTMENT ROWS */}
              {getData().map((a) => (
                <AppointmentCard
                  key={a.id}
                  a={a}
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* CHATBOT */}
      <div className="fixed bottom-5 right-5">
        <Chatbot />
      </div>
    </>
  );
};

export default PatientAppointmentsPage;

// ================= CARD COMPONENT =================
const AppointmentCard = ({
  a,
  onCancel,
  onReschedule,
}: {
  a: Appointment;
  onCancel: (id: number) => void;
  onReschedule: (
    id: number,
    date: string,
    start: string,
    end: string
  ) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState(a.date);
  const [newStart, setNewStart] = useState(a.start_time);
  const [newEnd, setNewEnd] = useState(a.end_time);

  const isPast = new Date(a.date) < new Date();
  const isCancelled = a.is_rejected;

  const getStatus = () => {
    if (isCancelled) return "Cancelled";
    if (isPast) return "Completed";
    return "Upcoming";
  };

  const getStatusStyle = () => {
    if (isCancelled) return "bg-red-100 text-red-600";
    if (isPast) return "bg-green-100 text-green-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <div className="grid grid-cols-[2.2fr_1.2fr_1.5fr_1fr_1.5fr] items-center px-6 py-4 border-b hover:bg-gray-50">

      {/* DOCTOR */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          👨‍⚕️
        </div>
        <div>
          <p className="font-semibold whitespace-nowrap">Dr. {a.doctor_name}</p>
          <p className="text-sm text-gray-500">{a.specialization}</p>
        </div>
      </div>

      {/* DATE */}
      <div className="text-sm text-gray-600">
        {isEditing ? (
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        ) : (
          new Date(a.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        )}
      </div>

      {/* TIME */}
      <div className="text-sm text-gray-600 whitespace-nowrap">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        ) : (
          `${new Date(
            `1970-01-01T${a.start_time}`
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })} - ${new Date(
            `1970-01-01T${a.end_time}`
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`
        )}
      </div>

      {/* STATUS */}
      <div className="flex justify-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle()}`}
        >
          {getStatus()}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 items-center min-w-[220px]">
        {!isEditing ? (
          <>
            {!isCancelled && !isPast && (
              <>
                <button
                  onClick={() => onCancel(a.id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reschedule
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onReschedule(a.id, newDate, newStart, newEnd);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Save
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};