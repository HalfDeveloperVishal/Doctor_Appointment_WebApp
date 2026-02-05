import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../User/Context/AuthContext";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import styles from "./LoginForm.module.css";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSuccess = async (loginData: any) => {
    localStorage.setItem("access_token", loginData.access);
    localStorage.setItem("refresh_token", loginData.refresh);

    login({
      role: loginData.role,
      userId: loginData.user_id,
    });

    toast.success(loginData.message || "Login successful!");

    if (loginData.role === "doctor") {
      try {
        const checkProfile = await axios.get(
          "http://localhost:8000/doctor/doctor_profile_check/",
          {
            headers: { Authorization: `Bearer ${loginData.access}` },
            withCredentials: true,
          }
        );

        navigate(
          checkProfile.data.has_profile
            ? "/doctor-dashboard"
            : "/doctor-profile-create"
        );
      } catch {
        navigate("/doctor-dashboard");
      }
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/login/",
        formData,
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      await handleLoginSuccess(res.data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/google-login/",
        { credential: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      await handleLoginSuccess(res.data);
    } catch {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Login</h2>
          <p className={styles.subtitle}>
            Welcome back! Please login to continue.
          </p>

          <div className={styles.googleWrapper}>
            <GoogleLogin onSuccess={handleGoogleLogin} />
          </div>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine} />
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Not registered?</p>
            <div className={styles.signupLinks}>
              <a href="/signup?role=doctor" className={styles.link}>
                Doctor Signup
              </a>
              <span className={styles.separator}>|</span>
              <a href="/signup?role=patient" className={styles.link}>
                Patient Signup
              </a>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
