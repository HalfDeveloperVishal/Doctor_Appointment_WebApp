import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/accounts/verify-email/${uid}/${token}/`
        );

        setMessage("Email verified successfully! Redirecting to login...");
        toast.success(res.data.message);

        setTimeout(() => navigate("/login"), 2000);
      } catch (err: any) {
        setMessage("Invalid or expired verification link.");
        toast.error(
          err.response?.data?.error || "Verification failed"
        );
      }
    };

    verifyEmail();
  }, [uid, token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default VerifyEmail;
