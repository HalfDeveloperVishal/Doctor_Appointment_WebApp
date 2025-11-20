import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = new URLSearchParams(location.search).get("role") || "patient";

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: role,
    agreeTerms: false,
    agreeMarketing: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      toast.warn("You must agree to the terms and conditions.");
      return;
    }

    try {
      const { agreeTerms, agreeMarketing, ...postData } = formData;

      const res = await axios.post(
        "http://localhost:8000/accounts/register/",
        postData,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(res.data.message || "Account created successfully!");
      navigate(`/login?role=${formData.role}`);
    } catch (err: any) {
      const backend = err.response?.data;

      let errorMsg =
        backend?.message ||
        backend?.error ||
        backend?.detail ||
        backend?.email?.[0] ||
        backend?.password?.[0] ||
        "Registration failed. Please check your inputs.";

      if (backend?.email?.[0]?.includes("exists")) {
        errorMsg = "User with this email already exists.";
      }

      toast.error(errorMsg);
    }
  };

  const handleGoogleSignUp = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/google-signup/",
        {
          credential: credentialResponse.credential,
          role: formData.role,
        }
      );

      if (res.status === 201) {
        toast.success("Account created successfully with Google!");
        navigate(`/login?role=${formData.role}`);
      }
    } catch (err: any) {
      const backend = err.response?.data;

      let errorMsg =
        backend?.message ||
        backend?.error ||
        backend?.detail ||
        "Google signup failed.";

      if (
        backend?.message?.toLowerCase().includes("exists") ||
        backend?.error?.toLowerCase().includes("exists")
      ) {
        errorMsg = "User already exists. Please login.";
      }

      toast.error(errorMsg);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
        <div className="bg-[var(--color-surface)] shadow-xl rounded-2xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden border border-gray-100">

          {/* LEFT IMAGE SECTION */}
          <div
            className="hidden md:flex relative text-white p-8 flex-col justify-center items-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1580281657527-47a1b0e6c168?auto=format&fit=crop&w=900&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[var(--color-primary)] bg-opacity-80 mix-blend-multiply"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-3 font-[var(--font-heading)]">Welcome to MedConnect</h2>
              <p className="text-blue-50 text-base">
                Your trusted online doctor appointment system.
              </p>
            </div>
          </div>

          {/* RIGHT FORM SECTION */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
              Create your account as <span className="capitalize">{role}</span>
            </h2>

            {/* GOOGLE SIGNUP */}
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSignUp}
                onError={() => toast.error("Google signup failed")}
                text="signup_with"
                width="330"
              />
            </div>

            <div className="flex items-center my-6">
              <hr className="flex-1 border-gray-200" />
              <span className="mx-3 text-[var(--color-text-muted)] text-sm">or</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NAME ROW */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email address"
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />

              <p className="text-xs text-[var(--color-text-muted)]">
                Use 8+ characters with letters, numbers & symbols
              </p>

              <div className="text-xs space-y-3 text-[var(--color-text-muted)]">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 accent-[var(--color-primary)]"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="text-[var(--color-primary)] underline hover:text-[var(--color-primary-hover)]">
                      Terms of use
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[var(--color-primary)] underline hover:text-[var(--color-primary-hover)]">
                      Privacy Policy
                    </a>.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                    className="mt-0.5 accent-[var(--color-primary)]"
                  />
                  <span>I agree to receive updates and notifications.</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-semibold text-sm shadow-md transition-colors mt-2"
              >
                Create Account
              </button>

              <p className="text-sm text-center mt-4 text-[var(--color-text-main)]">
                Already have an account?{" "}
                <a
                  href={`/login?role=${role}`}
                  className="text-[var(--color-primary)] font-semibold hover:underline"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUpForm;
