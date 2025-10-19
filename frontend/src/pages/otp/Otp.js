import React, { useEffect, useState, useRef } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../../api/client";
import { useSEO } from '../../lib/seo';
import logo from '../reusableAssets/logo.png';

function Otp() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(90);
  const [canResend, setCanResend] = useState(false);
  const userId = localStorage.getItem("userID");
  const intervalRef = useRef();

  // NEW: 6-digit inputs
  const DIGITS = 6;
  const [digits, setDigits] = useState(Array(DIGITS).fill(""));
  const inputsRef = useRef([]);

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
      timeoutId = setTimeout(() => { sendOtpAndStartTimer(); }, 1000);
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

  const focusInput = (idx) => {
    const el = inputsRef.current[idx];
    if (el) el.focus();
  };

  const handleChange = (idx, e) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");

    setDigits((prev) => {
      const next = [...prev];
      if (onlyDigits.length <= 1) {
        next[idx] = onlyDigits;
        if (onlyDigits.length === 1 && idx < DIGITS - 1) focusInput(idx + 1);
      } else {
        // Handle paste or multiple chars typed quickly
        let j = idx;
        for (const ch of onlyDigits.slice(0, DIGITS - idx)) {
          next[j] = ch;
          j++;
        }
        if (j <= DIGITS - 1) focusInput(j);
        else focusInput(DIGITS - 1);
      }
      return next;
    });
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      setDigits((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = "";
        } else if (idx > 0) {
          next[idx - 1] = "";
          focusInput(idx - 1);
        }
        return next;
      });
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight" && idx < DIGITS - 1) {
      e.preventDefault();
      focusInput(idx + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (idx, e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text") || "";
    const onlyDigits = text.replace(/\D/g, "");
    if (!onlyDigits) return;
    setDigits((prev) => {
      const next = [...prev];
      let j = idx;
      for (const ch of onlyDigits.slice(0, DIGITS - idx)) {
        next[j] = ch;
        j++;
      }
      if (j <= DIGITS - 1) focusInput(j);
      else focusInput(DIGITS - 1);
      return next;
    });
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    const newErrors = {};
    if (!otp) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = "OTP must be exactly 6 digits and numbers only";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await api.post(endpoints.verifyOtp(), { email, otp });
      navigate("/dashboard");
    } catch (err) {
      setOtpError(err.message || "Invalid OTP");
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
      setDigits(Array(DIGITS).fill(""));
      focusInput(0);
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
    title: 'Tutor Aid — OTP Verification',
    description: 'University Project: Enter the one-time PIN sent to your email to verify your account.',
    canonical: 'https://gabydv.xyz/otp',
  });

  return (
    <div className="page-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 justify-center items-center">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5">
          <img src={otpImage} alt="otp" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-2 text-center md:text-center">
            OTP Verification
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            We will send the one time pin to this email address:
          </p>
          <h3 className="text-gray-900 font-semibold mb-6 break-all">{email}</h3>

          {/* OTP inputs */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-2">Enter the OTP:</p>
            {digits.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl rounded-lg border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2B5561] focus:border-[#2B5561]"
                value={val}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
          {errors.otp && <div className="text-red-600 text-xs mb-2">{errors.otp}</div>}

          <button
            className="w-full h-11 rounded-lg bg-[#2B5561] hover:bg-[#2B5561]/80 text-white font-semibold transition"
            type="button"
            onClick={handleVerify}
          >
            Verify Code
          </button>

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
                <button className="text-[#2B5561] hover:underline" onClick={handleResendOtp}>
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