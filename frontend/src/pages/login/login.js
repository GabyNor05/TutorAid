import React, { useState } from "react";
import "./css/login.css";
import loginImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {X} from "@phosphor-icons/react";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [blockedModalOpen, setBlockedModalOpen] = useState(false);
    const [appealModalOpen, setAppealModalOpen] = useState(false);
    const [appealQuery, setAppealQuery] = useState("");
    const [studentID, setStudentID] = useState(null); // <-- Change made here

    const handleLoginClick = async () => {
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
            try {
                // Example using fetch:
                const response = await fetch("http://localhost:5000/api/users/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password })
                });

                const res = await response.json();
                console.log("Login response:", res);

                if (response.ok) {
                  // If student, check block status
                  if (res.student && res.student.status === "Blocked") {
                    setBlockedModalOpen(true);
                    setStudentID(res.student.studentID); // <-- Add this line
                  } else if (res.userID) {
                    localStorage.setItem("userID", res.userID);
                    navigate("/otp");
                  } else {
                    setErrors({ general: "Login failed" });
                  }
                } else {
                  setErrors({ general: res.error || "Login failed" });
                }
            } catch (err) {
                setErrors({ general: err.response?.data?.error || "Login failed" });
            }
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
                        <div className="login-form-group">
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
                        <div className="login-form-group">
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
                        {errors.general && (
                            <span style={{ color: "red", fontSize: "12px" }}>{errors.general}</span>
                        )}
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
        {blockedModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center gap-2 flex flex-col">
      
      <h3 className="text-lg font-semibold mb-2">Account Blocked</h3>
      
      <p className="mb-4">Your account has been blocked due to repeated violations. You cannot log in.</p>
      
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setBlockedModalOpen(true)}
        >
          Appeal Block
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={() => setBlockedModalOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{appealModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <form
      className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
      onSubmit={async e => {
        e.preventDefault();
        await axios.post("http://localhost:5000/api/studentRequests", {
          studentID: studentID,
          requestType: "Appeal_Block",
          query: appealQuery
        });
        setAppealModalOpen(false);
        alert("Your appeal has been submitted!");
      }}
    >
      <div className="modal-header flex flex-row items-center mb-4 justify-between">
                    <h3 className="text-lg font-semibold">Request Details</h3>
                    <button onClick={() => setAppealModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} weight="bold" />
                    </button>
                  </div>
      <textarea
        placeholder="Explain why you think your block should be reviewed..."
        value={appealQuery}
        onChange={e => setAppealQuery(e.target.value)}
        className="border rounded p-2 w-full"
        rows={4}
        required
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Appeal
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={() => setAppealModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
    </div>
    );
}

export default Login;