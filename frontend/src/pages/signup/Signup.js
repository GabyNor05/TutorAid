import React, { useState, useEffect } from "react";
import "./css/signup.css";
import signupImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Alert } from "react-bootstrap"; // Add this import

function Signup() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");


    const validate = () => {
        const newErrors = {};
        if (!username) newErrors.username = "Username is required";
        if (!email) {
            newErrors.email = "Email is required";
        } else {
            // Simple email regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Enter a valid email address";
            }
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
        return newErrors;
    };

    const handleSignUpClick = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axios.post('http://localhost:5000/api/users', {
                    name: username,
                    email,
                    password,
                    role: "Student"
                });
                localStorage.setItem("userID", response.data.userID);
                navigate("/onboarding");
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setPopupMessage(error.response.data.error);
                    setShowPopup(true);
                } else {
                    setErrors({ api: "Signup failed. Please try again." });
                }
            }
        }
    };

    return(
    <div>
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-image">
                    <img src={signupImage} alt="signup" />
                </div>
                <div className="signup-form">
                    <h2>Create your account</h2>
                    {/* Show React Bootstrap Alert */}
                    <Alert
                        show={showPopup}
                        variant="danger"
                        onClose={() => setShowPopup(false)}
                        dismissible
                        style={{ marginBottom: "16px" }}
                    >
                        {popupMessage}
                    </Alert>
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="signup-form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                className="h-10 w-full p-2 rounded-lg border-2 border-gray-300 shadow-inner"
                            />
                            {errors.username && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.username}</span>
                            )}
                        </div>
                        <div className="signup-form-group">
                            <label>Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="h-10 w-full p-2 rounded-lg border-2 border-gray-300 shadow-inner"
                            />
                            {errors.email && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>
                            )}
                        </div>
                        <div className="signup-form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="h-10 w-full p-2 rounded-lg border-2 border-gray-300 shadow-inner"
                            />
                            {errors.password && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.password}</span>
                            )}
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="signup-btn" type="button" onClick={handleSignUpClick}>Sign Up</button>
                        </div>  
                    </form>
                    <div className="login-link">
                        <p>Don't have an account?</p> 
                        <a href="/">Login</a>
                    </div>
                    <div className="Google-signup">
                        <button className="google-button-container" >
                        <div className="google-button">
                            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google Logo" />
                            <p>Sign up with Google</p>
                        </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Signup;