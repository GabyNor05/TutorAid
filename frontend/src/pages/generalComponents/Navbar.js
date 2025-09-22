import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {List} from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
     const role = "tutor";
     const navigate = useNavigate();
     const handleNavigation = (path) => {
        navigate(path);
    };
    return (
        <nav className="navbar">
            <div className="nav-logo">
                <img src={Logo} alt="Logo" className="logo" onClick={() => handleNavigation("/dashboard")} style={{ cursor: "pointer" }}/>
            </div>
            <div className="nav-links">
                
            </div>
            <div className="navMenu" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setShowMenu((prev) => !prev)} tabIndex={0} title="Profile menu">
                <List size={32} color={"#fff"} weight="bold"/>
            </div>
            
             {showMenu && (
              <div className="nav-dropdown">
                <button className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/dashboard");
                  }}
                >
                  Dashboard
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/lessonrequests");
                  }}
                >
                  Lesson Requests
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/studentfiles");
                  }}
                >
                  Student Files
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/lessonfeedback");
                  }}
                >
                  Lesson Feedback
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/userprofile");
                  }}
                >
                  My Profile
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/");
                  }}
                >
                  Login
                </button>
                <button
                  className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    navigate("/signup");
                  }}
                >
                  Signup
                </button>
                <button className="dropdown-item text-red-600 hover:text-blue-50 hover:font-semibold transition-colors"  onClick={() => {
                    setShowMenu(false);
                    navigate("/userprofile");
                  }}
                >
                  Log out
                </button>
                </div>
            )}   
        </nav>
    )
}

export default Navbar;