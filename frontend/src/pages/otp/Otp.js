import React, { useEffect, useState, useRef } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../../api/client";
import { useSEO } from '../../lib/seo';
import logo from '../reusableAssets/logo.png';

function Otp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(90);
  const [canResend, setCanResend] = useState(false);
  const userId = localStorage.getItem("userID");
  const intervalRef = useRef();

  const sendOtpAndStartTimer = async () => {
    try {
      const userRes = await api.get(endpoints.userById(userId));
      setEmail(userRes.email);
      await api.post(endpoints.sendOtp(), { email: userRes.email });
      setStatus("OTP sent to your email!");
      setCanResend(false);
      setTimer(90);
    } catch {
      setStatus("Failed to send OTP.");
    }
  };

  useEffect(() => {
    let timeoutId;
    if (userId) {
      timeoutId = setTimeout(() => {
        sendOtpAndStartTimer();
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [userId]);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  const handleotpClick = async () => {
    const newErrors = {};
    if (!otp) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = "OTP must be exactly 6 digits and numbers only";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await api.post(endpoints.verifyOtp(), { email, otp });
        navigate("/dashboard");
      } catch (err) {
        setOtpError(err.message || "Invalid OTP");
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      const userRes = await api.get(endpoints.userById(userId));
      setEmail(userRes.email);
      await api.post(endpoints.sendOtp(), { email: userRes.email });
      setStatus("New OTP sent to your email!");
      setCanResend(false);
      setTimer(90);
      setOtpError("");
    } catch {
      setStatus("Failed to resend OTP.");
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useSEO({
    title: 'OTP Verification — Tutor Aid',
    description: 'University Project: Enter the one-time PIN sent to your email to verify your account.',
    canonical: 'https://gabydv.xyz/otp',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5">
          <img src={otpImage} alt="otp" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-2 text-center md:text-left">
            OTP Verification
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">We will send the one time pin to this email address:</p>
          <h3 className="text-gray-900 font-semibold mb-6 break-all">{email}</h3>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.otp && <span className="text-red-600 text-xs">{errors.otp}</span>}
            </div>

            <button
              className="w-full h-11 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition"
              type="button"
              onClick={handleotpClick}
            >
              Verify Code
            </button>
          </form>

          <div className="mt-3 text-sm">
            {status && <div className="text-gray-700 mb-1">{status}</div>}
            {otpError && <div className="text-red-600">{otpError}</div>}

            {timer > 0 ? (
              <div className="mt-3">
                <span>
                  Resend code in: <strong>{formatTimer(timer)}</strong>
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <button className="text-cyan-700 hover:underline" onClick={handleResendOtp}>
                  Resend code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Otp;


// Server-side code (for reference)
// if (record.otp === otp) {
//     delete otpStore[email]; // Clear OTP after success
//     return res.json({ success: true });
// }