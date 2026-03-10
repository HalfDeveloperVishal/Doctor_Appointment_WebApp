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
import CheckEmail from "./components/Authentication/CheckEmail";
import VerifyEmail from "./components/Authentication/VerifyEmail";
import ForgotPassword from "./components/Authentication/ForgotPassoword";
import ResetPassword from "./components/Authentication/ResetPassword";
import VerifyPhonePage from "./components/Authentication/VerifyPhonePage";

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
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/verify-phone" element={<VerifyPhonePage/>} />

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
