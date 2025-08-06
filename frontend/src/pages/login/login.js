import React, { useEffect, useState } from "react";
import "./css/login.css";
import loginImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    
        const handleloginClick = () => {
            navigate("/otp");
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
                    <form>
                        <div className="form-group">
                            <label >Username</label>
                            <input type="text" id="username" name="username" required />
                        </div>
                        <div className="form-group">
                            <label >Password</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <div style={{width: "100%"}}>
                            <button className="login-btn"type="button"onClick={handleloginClick}>Login</button>
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