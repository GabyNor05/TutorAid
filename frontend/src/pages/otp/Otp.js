import React, { useEffect, useState, useRef } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Otp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [otpError, setOtpError] = useState("");
    const [status, setStatus] = useState("");
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(90); // 1 min 30 sec
    const [canResend, setCanResend] = useState(false);
    const userId = localStorage.getItem("userID");
    const intervalRef = useRef();

    // Send OTP and start timer
    const sendOtpAndStartTimer = async () => {
        try {
            const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
            setEmail(userRes.data.email);
            await axios.post("http://localhost:5000/api/users/send-otp", { email: userRes.data.email });
            setStatus("OTP sent to your email!");
            setCanResend(false);
            setTimer(90);
        } catch (err) {
            setStatus("Failed to send OTP.");
        }
    };

    useEffect(() => {
        let timeoutId;
        if (userId) {
            timeoutId = setTimeout(() => {
                sendOtpAndStartTimer();
            }, 2000); // 2 seconds delay
        }
        return () => clearTimeout(timeoutId); // Cleanup on unmount or re-mount
    }, [userId]);

    // Timer effect
    useEffect(() => {
        if (timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [timer]);

    const handleotpClick = async () => {
        const newErrors = {};
        if (!otp) {
            newErrors.otp = "OTP is required";
        } else if (!/^\d{6}$/.test(otp)) {
            newErrors.otp = "OTP must be exactly 6 digits and numbers only";
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                await axios.post("http://localhost:5000/api/users/verify-otp", { email, otp });
                navigate("/dashboard");
            } catch (err) {
                setOtpError(err.response?.data?.error || "Invalid OTP");
            }
        }
    };

    const handleResendOtp = async () => {
        try {
            const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
            setEmail(userRes.data.email); // Always update email before sending OTP
            await axios.post("http://localhost:5000/api/users/send-otp", { email: userRes.data.email });
            setStatus("New OTP sent to your email!");
            setCanResend(false);
            setTimer(90);
            setOtpError("");
        } catch (err) {
            setStatus("Failed to resend OTP.");
        }
    };

    // Format timer as MM:SS
    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div>
            <div className="otp-page">
                <div className="otp-container">
                    <div className="otp-image">
                        <img src={otpImage} alt="otp" />
                    </div>
                    <div className="otp-form">
                        <h2>OTP VERIFICATION</h2>
                        <p>We will send the one time pin to this email address:</p>
                        <h3>{email}</h3>
                        <form onSubmit={e => e.preventDefault()}>
                            <div className="form-group">
                                <label>OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                />
                                {errors.otp && (
                                    <span style={{ color: "red", fontSize: "12px" }}>{errors.otp}</span>
                                )}
                            </div>
                            <div style={{ width: "100%" }}>
                                <button className="otp-btn" type="button" onClick={handleotpClick}>Verify Code</button>
                            </div>
                        </form>
                        <div>{status}</div>
                        {otpError && <div style={{ color: "red" }}>{otpError}</div>}
                        {timer > 0 ? (
                            <div style={{ marginTop: "16px" }}>
                                <span>Resend code in: <strong>{formatTimer(timer)}</strong></span>
                            </div>
                        ) : (
                            <div style={{ marginTop: "16px" }}>
                                <a href="#" onClick={e => { e.preventDefault(); handleResendOtp(); }}>
                                    Resend code
                                </a>
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