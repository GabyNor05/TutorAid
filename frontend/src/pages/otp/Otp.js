import React, { useEffect, useState } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Otp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [email, setEmail] = useState(""); // Add this
    const [otpSent, setOtpSent] = useState(false);

    const userId = localStorage.getItem("userID");

    useEffect(() => {
        async function sendOtp() {
            try {
                const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setEmail(userRes.data.email);
                await axios.post("http://localhost:5000/api/users/send-otp", { email: userRes.data.email });
                setStatus("OTP sent to your email!");
                setOtpSent(true);
                localStorage.setItem("otpSent", "true");
            } catch (err) {
                setStatus("Failed to send OTP.");
            }
        }
        if (userId && !otpSent && localStorage.getItem("otpSent") !== "true") sendOtp();
    }, [userId, otpSent]);

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
                setErrors({ otp: err.response?.data?.error || "Invalid OTP" });
            }
        }
    };

    const handleSendOtp = async () => {
        try {
            const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
            setEmail(userRes.data.email);
            await axios.post("http://localhost:5000/api/users/send-otp", { email: userRes.data.email });
            setStatus("OTP sent to your email!");
            setOtpSent(true);
        } catch (err) {
            setStatus("Failed to send OTP.");
        }
    };

    return(
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
                        <div style={{width: "100%"}}>
                            <button className="otp-btn" type="button" onClick={handleotpClick}>Verify Code</button>
                        </div>
                    </form>
                    <div>{status}</div>
                    <button className="otp-btn" type="button" onClick={handleSendOtp} disabled={otpSent}>
                        Send OTP
                    </button>
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