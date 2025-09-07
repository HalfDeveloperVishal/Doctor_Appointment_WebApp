// src/pages/RoleSelect.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Register or Login As</h1>
      <div className="space-x-6">
        <button
          onClick={() => handleSelect('patient')}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-md font-semibold"
        >
          Patient
        </button>
        <button
          onClick={() => handleSelect('doctor')}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-md font-semibold"
        >
          Doctor
        </button>
      </div>
    </div>
  );
};

export default RoleSelect;
