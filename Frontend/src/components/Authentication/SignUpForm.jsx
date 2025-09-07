// SignUpForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const SignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = new URLSearchParams(location.search).get("role");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: role || "",
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

    if (!formData.agreeTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    try {
      const { agreeTerms, agreeMarketing, ...postData } = formData;

      const res = await axios.post("http://localhost:8000/accounts/register/", postData);

      alert(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed. Check your input.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl grid md:grid-cols-2 w-full max-w-5xl overflow-hidden">
        <div className="p-10 bg-gray-900 text-white hidden md:flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Design with us</h2>
          <p className="text-gray-300">
            Access to thousands of design resources and templates
          </p>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Sign up as {role}</h2>
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
              Use 8 or more characters with a mix of letters, numbers & symbols
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
                  By creating an account, I agree to the {" "}
                  <a href="#" className="underline">
                    Terms of use
                  </a>{" "}
                  and {" "}
                  <a href="#" className="underline">
                    Privacy Policy
                  </a>
                  .
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
                  I agree to receive SMS and email promotions and updates.
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 w-full rounded-md font-semibold"
            >
              Sign up
            </button>
            <p className="text-sm text-center mt-2">
              Already have an account? {" "}
              <a href="/login" className="underline">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;