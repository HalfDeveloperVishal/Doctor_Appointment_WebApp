import "./App.css";
import { Routes, Route } from "react-router-dom";
import SignUpForm from "./components/Authentication/SignUpForm";
import LoginForm from "./components/Authentication/LoginForm";
import { Homepage } from "./components/User/HomePage/Homepage";
import RoleSelect from "./components/Authentication/RoleSelect";
import ProfileCreation from "./components/doctor/DoctorProfile/ProfileCreation";
import DoctorProfileView from "./components/doctor/DoctorProfile/DoctorProfile";
import Layout from "./components/doctor/Layout";
import FindDoctorPage from "./components/User/FindDoctorPage/FindDoctorPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/choose-role" element={<RoleSelect />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route element={<Layout />}>
          <Route path="/doctor-dashboard" element={<h1>Doctor Dashboard Home</h1>} />
          <Route path="/doctor-profile-create" element={<ProfileCreation />} />
          <Route path="/doctor-profile" element={<DoctorProfileView />} />
        </Route>
        <Route path="/find-doctor" element={<FindDoctorPage/>} />
      </Routes>
    </div>
  );
}

export default App;