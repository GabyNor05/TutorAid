import React, { useEffect, useState } from "react";
import "./css/onboarding.css";
import onboardingImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";

function Onboarding() {
    const navigate = useNavigate();

    const handleonboardingClick = () => {
        navigate("/dashboard");
    };
    return(
    <div>
        <div className="onboarding-page">
            <div className="onboarding-container">
                <div className="onboarding-image">
                    <img src={onboardingImage} alt="onboarding" />
                </div>
                <div className="onboarding-form">
                    <h2>TELL US ABOUT YOURSELF?</h2>
                    <form>
                        <div className="form-group">
                            <label>What school do you go to?</label>
                            <input type="text" id="school" name="school" required />
                        </div>
                        <div className="form-group">
                            <label>What grade are you in?</label>
                            <input type="text" id="grade" name="grade" required />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="textarea" id="address" name="address" required />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input type="dropdown" id="city" name="city" required />
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="onboarding-btn"type="button" onClick={handleonboardingClick}>Go to Dashboard</button>
                        </div>
                        
                    </form>
                    
                </div>
            </div>
        </div>
    </div>
    );
}

export default Onboarding;