import React from "react";

interface SuccessPageProps {
  successMsg: string;
}

const SuccessPage = React.memo(({ successMsg }: SuccessPageProps) => (
  <div className="text-center mt-20">
    <h2 className="text-2xl font-bold text-green-600 mb-2">Appointment Confirmed 🎉</h2>
    <p className="text-gray-600">{successMsg}</p>
    <p className="text-sm text-gray-500 mt-2">Redirecting to homepage...</p>
  </div>
));

export default SuccessPage;
