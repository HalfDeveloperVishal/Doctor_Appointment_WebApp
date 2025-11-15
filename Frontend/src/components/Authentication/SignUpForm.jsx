import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUpForm = () => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 Check Terms
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
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);

      // 🔥 Extract meaningful error text
      const backend = err.response?.data;

      let errorMsg =
        backend?.message ||
        backend?.error ||
        backend?.detail ||
        backend?.email?.[0] || // Django: {"email":["A user with this email already exists."]}
        backend?.password?.[0] || // Django password validation
        "Registration failed. Please check your inputs.";

      // 🔥 Special case: user already exists
      if (backend?.email?.[0]?.includes("exists")) {
        errorMsg = "User with this email already exists. Please login.";
      }

      toast.error(errorMsg);
    }
  };

  // ======================================
  //       GOOGLE SIGNUP HANDLER
  // ======================================
  const handleGoogleSignUp = async (credentialResponse) => {
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
    } catch (err) {
      console.error("Google signup error:", err.response?.data || err);

      const backend = err.response?.data;

      let errorMsg =
        backend?.message ||
        backend?.error ||
        backend?.detail ||
        "Google signup failed.";

      // If user already exists
      if (
        backend?.message?.toLowerCase().includes("exists") ||
        backend?.error?.toLowerCase().includes("exists")
      ) {
        errorMsg = "User already exists with Google. Please log in.";
      }

      toast.error(errorMsg);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl grid md:grid-cols-2 w-full max-w-5xl overflow-hidden">

          {/* Left side panel */}
          <div className="p-10 bg-gray-900 text-white hidden md:flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Design with us</h2>
            <p className="text-gray-300">
              Access to thousands of design resources and templates
            </p>
          </div>

          {/* Right side form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">
              Sign up as <span className="capitalize text-gray-700">{role}</span>
            </h2>

            {/* Google Sign Up */}
            <GoogleLogin
              onSuccess={handleGoogleSignUp}
              onError={() => toast.error("Google signup failed")}
              text="signup_with"
              shape="rectangular"
            />

            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="mx-2 text-gray-400">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="flex gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  onChange={handleChange}
                  className="border w-full p-2 rounded-md"
                  required
                />

                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  onChange={handleChange}
                  className="border w-full p-2 rounded-md"
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email address"
                onChange={handleChange}
                className="border w-full p-2 rounded-md"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="border w-full p-2 rounded-md"
                required
              />

              <p className="text-sm text-gray-500">
                Use 8+ characters with letters, numbers & symbols
              </p>

              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="underline">Terms of use</a> and{" "}
                    <a href="#" className="underline">Privacy Policy</a>.
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to receive SMS and email promotions.
                  </span>
                </label>
              </div>

              <input type="hidden" name="role" value={formData.role} />

              <button
                type="submit"
                className="bg-gray-700 hover:bg-gray-800 text-white py-2 w-full rounded-md font-semibold"
              >
                Sign up
              </button>

              <p className="text-sm text-center mt-2">
                Already have an account?{" "}
                <a
                  href={`/login?role=${role}`}
                  className="underline text-blue-600"
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
