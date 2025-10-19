import React, { useState } from "react";
import "./css/login.css";
import loginImage from "./assets/loginImage.png";
import WhiteWallpaper from '../reusableAssets/whitepaper.png';
import { useNavigate } from "react-router-dom";
import { X } from "@phosphor-icons/react";
import { api, endpoints } from "../../api/client";
import { useSEO } from '../../lib/seo';
import logo from '../reusableAssets/logo.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealQuery, setAppealQuery] = useState("");
  const [studentID, setStudentID] = useState(null);

  useSEO({
    title: 'Tutor Aid — Login',
    description: 'University Project: Log in to access your dashboard, tutors, and lessons.',
    canonical: 'https://gabydv.xyz/login',
  });

  const handleLoginClick = async () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
      }
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await api.post(endpoints.login(), { email, password });
        if (res.student && res.student.status === "Blocked") {
          setBlockedModalOpen(true);
          setStudentID(res.student.studentID);
        } else if (res.userID) {
          localStorage.setItem("userID", res.userID);
          navigate("/otp");
        } else {
          setErrors({ general: "Login failed" });
        }
      } catch (err) {
        setErrors({ general: err.message || "Login failed" });
      }
    }
  };

  return (
    <div className="page-background max-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-3/4">
        {/* Image */}
        <div className="hidden md:block bg-[#2B5561]/5">
          <img src={loginImage} alt="Login" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-8 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-6 text-center md:text-left">Login</h2>
          <form onSubmit={(e) => e.preventDefault()} className="login-form space-y-4">
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
            </div>

            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.password && <span className="text-red-600 text-xs">{errors.password}</span>}
            </div>

            {errors.general && <div className="text-red-600 text-xs">{errors.general}</div>}

            <button
              className="login-btn w-3/4 h-12 rounded-[4px] text-white font-semibold transition hover:bg-[#2B5561]/70"
              type="submit"
              onClick={handleLoginClick}
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* Blocked modal */}
      {blockedModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center gap-2 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Account Blocked</h3>
            <p className="mb-2">Your account has been blocked due to repeated violations. You cannot log in.</p>
            <div className="flex gap-2 mt-2 justify-center">
              <button
                type="button"
                className="bg-[#2B5561] text-white px-4 py-2 rounded hover:bg-[#2B5561]/70"
                onClick={() => {
                  setBlockedModalOpen(false);
                  setAppealModalOpen(true);
                }}
              >
                Appeal Block
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setBlockedModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal modal */}
      {appealModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <form
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await api.post(endpoints.studentRequests(), {
                studentID,
                requestType: "Appeal_Block",
                query: appealQuery,
              });
              setAppealModalOpen(false);
              alert("Your appeal has been submitted!");
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button onClick={() => setAppealModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} weight="bold" />
              </button>
            </div>
            <textarea
              placeholder="Explain why you think your block should be reviewed..."
              value={appealQuery}
              onChange={(e) => setAppealQuery(e.target.value)}
              className="border rounded p-2 w-full min-h-28"
              required
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-[#2B5561] text-white px-4 py-2 rounded hover:bg-[#2B5561]/70">
                Submit Appeal
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setAppealModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;