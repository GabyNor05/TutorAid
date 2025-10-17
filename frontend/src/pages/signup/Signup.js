import React, { useState } from "react";
import "./css/signup.css";
import signupImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "react-bootstrap";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!email) newErrors.email = "Email is required";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    }
    if (!password) newErrors.password = "Password is required";
    else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
      }
    }
    return newErrors;
  };

  const handleSignUpClick = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(`${API_URL}/api/users`, {
          name: username,
          email,
          password,
          role: "Student",
        });
        localStorage.setItem("userID", response.data.userID);
        navigate("/onboarding");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setPopupMessage(error.response.data.error);
          setShowPopup(true);
        } else {
          setErrors({ api: "Signup failed. Please try again." });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5">
          <img src={signupImage} alt="signup" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-4 text-center md:text-left">
            Create your account
          </h2>

          <Alert
            show={showPopup}
            variant="danger"
            onClose={() => setShowPopup(false)}
            dismissible
            className="mb-4"
          >
            {popupMessage}
          </Alert>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.username && <span className="text-red-600 text-xs">{errors.username}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.password && <span className="text-red-600 text-xs">{errors.password}</span>}
            </div>

            {errors.api && <div className="text-red-600 text-xs">{errors.api}</div>}

            <button
              className="w-full h-11 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition"
              type="button"
              onClick={handleSignUpClick}
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a href="/login" className="text-cyan-700 hover:underline">
              Login
            </a>
          </div>

          {/* Optional Google Signup button kept, with responsive styles */}
          <div className="mt-4">
            <button className="w-full h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
              <img
                src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                alt="Google Logo"
                className="w-5 h-5"
              />
              <p className="text-sm font-medium text-gray-700">Sign up with Google</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;