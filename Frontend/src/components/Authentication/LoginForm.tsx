import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../User/Context/AuthContext";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";

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

        if (checkProfile.data.has_profile) {
          navigate("/doctor-dashboard");
        } else {
          navigate("/doctor-profile-create");
        }
      } catch (error) {
        toast.error("Error verifying profile.");
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
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      await handleLoginSuccess(res.data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials";
      toast.error(errorMsg);
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
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      await handleLoginSuccess(res.data);
    } catch (err) {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[var(--color-background)] flex justify-center items-center p-4">
        <div className="w-full max-w-[380px] bg-[var(--color-surface)] p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-center text-[var(--color-primary)] text-3xl font-bold mb-2">Login</h2>
          <p className="text-center text-[var(--color-text-muted)] mb-6 text-sm">Welcome back! Please login to continue.</p>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
              width="330"
            />
          </div>

          <div className="flex items-center my-4 text-sm text-[var(--color-text-muted)] justify-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-3 bg-[var(--color-surface)]">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-main)]">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-main)]">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 p-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full text-base font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-main)]">
            Not registered?{" "}
            <div className="mt-1 space-x-3">
              <a href="/signup?role=doctor" className="text-[var(--color-primary)] font-semibold hover:underline">Doctor Signup</a>
              <span className="text-gray-300">|</span>
              <a href="/signup?role=patient" className="text-[var(--color-primary)] font-semibold hover:underline">Patient Signup</a>
            </div>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
