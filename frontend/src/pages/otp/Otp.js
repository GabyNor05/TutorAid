import React, { useEffect, useState } from "react";
import "./css/otp.css";
import otpImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";

function Otp() {
    const navigate = useNavigate();

    const handleotpClick = () => {
        navigate("/dashboard");
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
                    <form>
                        <div className="form-group">
                            <label>OTP</label>
                            <input type="dropdown" id="otp" name="otp" required />
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="otp-btn"type="button" onClick={handleotpClick}>Verify Code</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Otp;