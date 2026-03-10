import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./VerifyPhonePage.module.css";

const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (phone.length !== 10) {
      toast.warning("Enter a valid 10 digit phone number");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:8000/accounts/send-otp/", {
        phone_number: `+91${phone}`,
      });

      setOtpSent(true);
      toast.success("OTP sent successfully");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      toast.warning("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:8000/accounts/verify-otp/", {
        phone_number: `+91${phone}`,
        otp: otp,
        user_id: userId,
      });

      toast.success("Phone verified successfully");

      navigate("/login");
    } catch {
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Verify Phone Number</h2>
        <p className={styles.subtext}>
          Enter your mobile number to receive an OTP
        </p>

        {/* Phone Input */}
        <div className={styles.phoneContainer}>
          <span className={styles.prefix}>+91</span>

          <input
            className={styles.input}
            placeholder="9876543210"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) setPhone(value);
            }}
          />
        </div>

        <button className={styles.button} onClick={sendOTP} disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {otpSent && (
          <div className={styles.otpSection}>
            <input
              className={styles.otpInput}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className={styles.button}
              onClick={verifyOTP}
              disabled={loading}
            >
              Verify OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhonePage;
