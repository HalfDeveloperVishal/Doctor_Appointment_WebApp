import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../User/Context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/login/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Store tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Update auth context
      login({
        role: res.data.role,
        userId: res.data.user_id,
      });

      // Redirect based on role
      if (res.data.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/");
      }

      toast.success(res.data.message || "Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <span className="input-span">
          <label htmlFor="email" className="label">
            Email
          </label>
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
          <label htmlFor="password" className="label">
            Password
          </label>
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

        <button
          type="submit"
          className="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>

        <span className="span">
          Don't have an account?{" "}
          <a href="/choose-role">Sign up</a>
        </span>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #ffffff; /* Pure white background now */

  .form {
    --bg-dark: #707070;
    --clr: #58bc82;
    --clr-alpha: #9c9c9c60;

    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 320px;

    /* Removed card styles */
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .form .input-span {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form input[type="email"],
  .form input[type="password"] {
    border-radius: 0.5rem;
    padding: 1rem 0.75rem;
    width: 100%;
    border: none;
    background-color: var(--clr-alpha);
    outline: 2px solid var(--bg-dark);
    transition: outline 0.3s ease;
  }

  .form input[type="email"]:focus,
  .form input[type="password"]:focus {
    outline: 2px solid var(--clr);
  }

  .label {
    align-self: flex-start;
    color: var(--clr);
    font-weight: 600;
  }

  .form .submit {
    padding: 1rem 0.75rem;
    width: 100%;
    border-radius: 3rem;
    background-color: var(--bg-dark);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: all 300ms;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form .submit:hover:not(:disabled) {
    background-color: var(--clr);
    color: var(--bg-dark);
  }

  .form .submit:disabled {
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
