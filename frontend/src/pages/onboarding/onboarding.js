import React, { useEffect, useState } from "react";
import "./css/onboarding.css";
import onboardingImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Onboarding() {
    const navigate = useNavigate();
    const [school, setSchool] = useState("");
    const [grade, setGrade] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [status, setStatus] = useState("");
    const [errors, setErrors] = useState({});

    const handleOnboardingClick = async () => {
        const newErrors = {};
        if (!school) newErrors.school = "School is required";
        if (!grade) newErrors.grade = "Grade is required";
        if (!address) newErrors.address = "Address is required";
        if (!city) newErrors.city = "City is required";
        if (!province) newErrors.province = "Province is required";
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                // Get userId from context, props, or localStorage
                const userID = localStorage.getItem("userID"); // Example
                console.log("userID from localStorage:", userID);
                // Send a PUT request to update user and student info
                await axios.put(`http://localhost:5000/api/users/${userID}`, {
                    role: "Student", // Make sure this is included!
                    grade,
                    school,
                    address,
                    city,
                    province,
                    status
                });
                navigate("/dashboard");
            } catch (error) {
                setErrors({ api: "Onboarding failed. Please try again." });
            }
        }
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
                            <input
                                type="text"
                                id="school"
                                name="school"
                                value={school}
                                onChange={e => setSchool(e.target.value)}
                                required
                            />
                            {errors.school && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.school}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>What grade are you in?</label>
                            <input
                                type="text"
                                id="grade"
                                name="grade"
                                value={grade}
                                onChange={e => setGrade(e.target.value)}
                                required
                            />
                            {errors.grade && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.grade}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                required
                            />
                            {errors.address && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.address}</span>
                            )}
                        </div>
                        <div className ="address-row">
                            <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                required
                            />
                            {errors.city && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.city}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Province</label>
                            <select
                                id="province"
                                name="province"
                                value={province}
                                onChange={e => setProvince(e.target.value)}
                                required
                            >
                                <option value="">Select Province</option>
                                <option value="Eastern Cape">Eastern Cape</option>
                                <option value="Free State">Free State</option>
                                <option value="Gauteng">Gauteng</option>
                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                <option value="Limpopo">Limpopo</option>
                                <option value="Mpumalanga">Mpumalanga</option>
                                <option value="North West">North West</option>
                                <option value="Northern Cape">Northern Cape</option>
                                <option value="Western Cape">Western Cape</option>
                            </select>
                            {errors.province && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.province}</span>
                            )}
                        </div>
                        </div>
                        
                        <div style={{width: "100%"}}>
                            <button className="onboarding-btn"type="button" onClick={handleOnboardingClick}>Go to Dashboard</button>
                        </div>
                        
                    </form>
                    
                </div>
            </div>
        </div>
    </div>
    );
}

export default Onboarding;