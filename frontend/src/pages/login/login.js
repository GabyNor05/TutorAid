import React, { useState } from "react";
import "./css/login.css";
import loginImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import { X, House } from "@phosphor-icons/react";
import { api, endpoints } from "../../api/client";
import { useSEO } from '../../lib/seo';
import { analytics } from '../../api/../lib/analytics';

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

    const tutorIsSelected = localStorage.getItem('selectedTutorID');

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await api.post(endpoints.login(), { email: email.trim(), password });
        if (res.student && res.student.status === "Blocked") {
          setBlockedModalOpen(true);
          setStudentID(res.student.studentID);
        } else if (res.userID) {
          const { userID, role } = res;
          localStorage.setItem('userID', userID);
          analytics.setUser(userID, { role });            // set user_id + role
          analytics.event('login', { method: 'password' }); // GA4 recommended event
          navigate("/otp");
        } else {
          setErrors({ general: "Login failed" });
        }
      } catch (err) {
        const msg = String(err.message || "");
        setErrors({ general: msg.startsWith("HTTP 401") ? "Invalid email or password" :
                         msg.startsWith("Network") ? "Cannot reach server. Please try again later." :
                         msg.replace(/^HTTP \d+\s-\s/, '') || "Login failed" });
      }
    }
  };

  return (
    <div className="page-background min-h-dvh flex flex-colitems-center justify-center px-4 py-8">
      <button
        type="button"
        style={{ position: 'fixed', left: 16, top: 80, zIndex: 2147483647 }}
        className="px-3 py-1.5 bg-[#2B5561] text-white text-lg hover:border-[#2B5561]/70 border-2 rounded-lg flex flex-row items-center gap-2"
        onClick={() => {
          navigate('/');
        }}
      >
         <House size={24} /> Home
      </button>
      <div className="w-full max-w-5xl h-[75dvh] bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch min-h-0">
        {/* Image */}
        <div className="hidden md:block bg-[#2B5561]/5 h-full min-h-0">
          <img src={loginImage} alt="Login" className="h-full w-full object-fit" />
        </div>

        {/* Form */}
        <div className="h-full min-h-0 p-6 sm:p-8 overflow-y-auto flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-4 text-center md:text-center">Login</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 flex flex-col justify-center items-center w-full gap-2">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.password && <span className="text-red-600 text-xs">{errors.password}</span>}
            </div>

            {errors.general && <div className="text-red-600 text-xs">{errors.general}</div>}

            <button
              className="login-btn mr-auto w-3/4 h-12 rounded-[4px] bg-[#2B5561] text-white font-semibold transition hover:bg-[#2B5561]/70"
              type="button"
              onClick={handleLoginClick}
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a href="/forgotpassword" className="text-blue-600 hover:underline">Forgot Password?</a>
          </div>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
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