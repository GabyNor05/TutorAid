import React, { useEffect, useState } from "react";
import "./css/signup.css";
import signupImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const handleSignUpClick = () => {
        navigate("/onboarding");
    };
    return(
    <div>
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-image">
                    <img src={signupImage} alt="signup" />
                </div>
                <div className="signup-form">
                    <h2>Sign up</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" name="name" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" id="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="signup-btn"type="button" onClick={handleSignUpClick}>Sign up</button>
                        </div>
                        
                    </form>
                    <div className="login-link">
                        <p>Don't have an account?</p> 
                        <a href="/login">Login</a>
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