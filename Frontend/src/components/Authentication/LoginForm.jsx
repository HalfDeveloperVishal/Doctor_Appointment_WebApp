import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../User/Context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import styled from "styled-components";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Extract role from query params
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Common navigation after login
  const handleLoginSuccess = async (loginData) => {
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
        console.error("Profile check error:", error);
        toast.error("Error verifying doctor profile. Redirecting...");
        navigate("/doctor-dashboard");
      }
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
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
    } catch (err) {
      console.error("Login error:", err);

      // 🔥 Improved Toastify error messages
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Invalid email or password. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/google-login/",
        {
          credential: credentialResponse.credential,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      await handleLoginSuccess(res.data);
    } catch (err) {
      console.error("Google login error:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Google login failed. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <StyledWrapper>
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="form-title">Log In</h2>

          {/* Google Login */}
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
              theme="outline"
              size="large"
              width="320"
            />
          </div>

          <div className="divider">
            <hr className="divider-line" />
            <span className="divider-text">or</span>
            <hr className="divider-line" />
          </div>

          <span className="input-span">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </span>

          <span className="input-span">
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </span>

          <span className="span">
            <a href="#">Forgot password?</a>
          </span>

          <button type="submit" className="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          <span className="span">
            Don't have an account?{" "}
            <a href="/signup?role=patient" className="signup-link">Sign up as Patient</a> |{" "}
            <a href="/signup?role=doctor" className="signup-link">Sign up as Doctor</a>
          </span>
        </form>
      </StyledWrapper>
    </GoogleOAuthProvider>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #ffffff;

  .form {
    --bg-dark: #707070;
    --clr: #58bc82;
    --clr-alpha: #9c9c9c60;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 320px;
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .form-title {
    color: var(--bg-dark);
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .google-login-container {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0;
  }

  .divider-line {
    flex: 1;
    border: none;
    border-top: 1px solid #d1d5db;
  }

  .divider-text {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .form .input-span {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form input {
    border-radius: 0.5rem;
    padding: 1rem 0.75rem;
    border: none;
    background-color: var(--clr-alpha);
    outline: 2px solid var(--bg-dark);
    transition: outline 0.3s ease;
  }

  .form input:focus {
    outline: 2px solid var(--clr);
  }

  .label {
    color: var(--clr);
    font-weight: 600;
  }

  .submit {
    padding: 1rem 0.75rem;
    border-radius: 3rem;
    background-color: var(--bg-dark);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: all 300ms;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .submit:hover:not(:disabled) {
    background-color: var(--clr);
    color: var(--bg-dark);
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .span {
    font-size: 0.9rem;
    color: var(--bg-dark);
    text-align: center;
  }

  .span a {
    color: var(--clr);
    text-decoration: none;
  }
`;

export default LoginForm;