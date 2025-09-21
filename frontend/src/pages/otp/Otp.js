import React, { useEffect, useState } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";

function Otp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});

    const handleotpClick = () => {
        const newErrors = {};
        if (!otp) {
            newErrors.otp = "OTP is required";
        } else if (!/^\d{6}$/.test(otp)) {
            newErrors.otp = "OTP must be exactly 6 digits and numbers only";
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Proceed with navigation or API call
            navigate("/");
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
                    <h3>samth4@gmail.com</h3>
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
                </div>
            </div>
        </div>
    </div>
    );
}

export default Otp;