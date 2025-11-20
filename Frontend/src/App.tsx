import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignUpForm from "./components/Authentication/SignUpForm";
import LoginForm from "./components/Authentication/LoginForm";
import { Homepage } from "./components/User/HomePage/Homepage";
import ProfileCreation from "./components/doctor/DoctorProfile/ProfileCreation";
import DoctorProfileView from "./components/doctor/DoctorProfile/DoctorProfile";
import Layout from "./components/doctor/Layout";
import FindDoctorPage from "./components/User/FindDoctorPage/FindDoctorPage";
import AppointmnetInfoPage from "./components/doctor/AppointmentPage/AppointmnetInfoPage";
import MultiStepSlotBooking from "./components/User/BookingPage/SlotBookingPage";
import Dashboard from "./components/doctor/Dashboard/Dashboard";
import PatientAppointmentsPage from "./components/User/PatientAppoinmentPage/PatientAppoinmentPage";

function App() {
  return (
    <div>
      {/* ✅ Toastify Must Be At The Top Level */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/find-doctor" element={<FindDoctorPage />} />
        <Route path="/doctor/:id/slots" element={<MultiStepSlotBooking />} />
        <Route
          path="/patient-appointment"
          element={<PatientAppointmentsPage />}
        />

        {/* Auth pages (standalone, no navbar) */}
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Doctor section with doctor layout */}
        <Route element={<Layout />}>
          <Route path="/doctor-dashboard" element={<Dashboard />} />
          <Route path="/doctor-profile-create" element={<ProfileCreation />} />
          <Route path="/doctor-profile" element={<DoctorProfileView />} />
          <Route path="/appointment-info" element={<AppointmnetInfoPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
