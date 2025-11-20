import React from "react";

const PreLoginNavbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white font-bold text-xl rounded-xl px-2 py-1">
          H+
        </div>
        <h1 className="text-xl font-semibold text-gray-800">MedConnect</h1>
      </div>
    </nav>
  );
};

export default PreLoginNavbar;
