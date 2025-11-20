import { Outlet } from "react-router-dom";
import DoctorNavbar from "./HomePage/DoctorNavbar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <DoctorNavbar />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;