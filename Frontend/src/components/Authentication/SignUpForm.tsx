import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import signupImage from "../../assets/signup-doctor.jpg";

import styles from "./SignUpForm.module.css";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = new URLSearchParams(location.search).get("role") || "patient";

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: role,
    agreeTerms: false,
    agreeMarketing: false,
  });

  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordRules = {
    length: (pwd: string) => pwd.length >= 8,
    uppercase: (pwd: string) => /[A-Z]/.test(pwd),
    lowercase: (pwd: string) => /[a-z]/.test(pwd),
    number: (pwd: string) => /\d/.test(pwd),
    special: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };

  const passwordStatus = {
    length: passwordRules.length(formData.password),
    uppercase: passwordRules.uppercase(formData.password),
    lowercase: passwordRules.lowercase(formData.password),
    number: passwordRules.number(formData.password),
    special: passwordRules.special(formData.password),
  };

  const isPasswordValid = Object.values(passwordStatus).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "password") {
      setPasswordTouched(true);
    }

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

    if (!isPasswordValid) {
      toast.warn("Please follow all password rules.");
      return;
    }

    try {
      const { agreeTerms, agreeMarketing, ...postData } = formData;

      const res = await axios.post(
        "http://localhost:8000/accounts/register/",
        postData,
        { headers: { "Content-Type": "application/json" } },
      );

      toast.success(res.data.message || "Account created successfully!");
      navigate(`/login?role=${formData.role}`);
    } catch {
      toast.error("Registration failed.");
    }
  };

  const handleGoogleSignUp = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/accounts/google-signup/",
        {
          credential: credentialResponse.credential,
          role: formData.role,
        },
      );

      if (res.status === 201) {
        toast.success("Account created successfully with Google!");
        navigate(`/login?role=${formData.role}`);
      }
    } catch {
      toast.error("Google signup failed.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* LEFT IMAGE */}
          <div className={styles.left}>
            <img
              src={signupImage}
              alt="Signup illustration"
              className={styles.leftImage}
            />
          </div>

          {/* RIGHT FORM */}
          <div className={styles.right}>
            <h2 className={styles.heading}>
              Create your account as <span className="capitalize">{role}</span>
            </h2>

            <div className={styles.googleWrapper}>
              <GoogleLogin onSuccess={handleGoogleSignUp} />
            </div>

            <div className={styles.divider}>
              <hr />
              <span>or</span>
              <hr />
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <input
                  className={styles.input}
                  name="first_name"
                  placeholder="First name"
                  onChange={handleChange}
                  required
                />
                <input
                  className={styles.input}
                  name="last_name"
                  placeholder="Last name"
                  onChange={handleChange}
                  required
                />
              </div>

              <input
                className={styles.input}
                name="email"
                type="email"
                placeholder="Email address"
                onChange={handleChange}
                required
              />

              <input
                className={styles.input}
                name="phone_number"
                type="tel"
                placeholder="Phone number"
                onChange={handleChange}
                required
              />

              <input
                className={styles.input}
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />

              {/* PASSWORD RULES */}
              {passwordTouched && !isPasswordValid && (
                <ul className={styles.passwordRules}>
                  <li
                    className={
                      passwordStatus.length ? styles.valid : styles.invalid
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      passwordStatus.uppercase ? styles.valid : styles.invalid
                    }
                  >
                    One uppercase letter (A–Z)
                  </li>
                  <li
                    className={
                      passwordStatus.lowercase ? styles.valid : styles.invalid
                    }
                  >
                    One lowercase letter (a–z)
                  </li>
                  <li
                    className={
                      passwordStatus.number ? styles.valid : styles.invalid
                    }
                  >
                    One number (0–9)
                  </li>
                  <li
                    className={
                      passwordStatus.special ? styles.valid : styles.invalid
                    }
                  >
                    One special character (!@#$%^&)
                  </li>
                </ul>
              )}

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the <a className={styles.link}>Terms</a> and{" "}
                    <a className={styles.link}>Privacy Policy</a>
                  </span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                  />
                  <span>I agree to receive updates.</span>
                </label>
              </div>

              <button className={styles.submit}>Create Account</button>

              <p className={styles.footer}>
                Already have an account?{" "}
                <a href={`/login?role=${role}`}>Log in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUpForm;
