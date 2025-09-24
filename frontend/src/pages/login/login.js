import React, { useState } from "react";
import "./css/login.css";
import loginImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    const handleLoginClick = () => {
        const newErrors = {};
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
            // Regex: min 8 chars, 1 uppercase, 1 number, 1 special char
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(password)) {
                newErrors.password =
                    "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
            }
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Proceed with navigation or API call
            navigate("/otp");
        }
    };

    return(
    <div>
        <div className="login-page">
            <div className="login-container">
                <div className="login-image">
                    <img src={loginImage} alt="Login" />
                </div>
                <div className="login-form">
                    <h2>Login</h2>
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {errors.password && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.password}</span>
                            )}
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="login-btn" type="button" onClick={handleLoginClick}>Login</button>
                        </div>
                    </form>
                    <div className="signup-link">
                        <p>Don't have an account?</p> 
                        <a href="/signup">Sign up</a>
                    </div>
                    <div className="Google-login">
                        <button className="google-button-container" >
                        <div className="google-button">
                            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google Logo" />
                            <p>Login with Google</p>
                        </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Login;