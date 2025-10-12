import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List } from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";
import axios from "axios";

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userID");

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/users/${userId}`)
                .then(res => setRole(res.data.role))
                .catch(err => setRole(null));
        }
    }, [userId]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <img src={Logo} alt="Logo" className="logo" onClick={() => handleNavigation("/dashboard")} style={{ cursor: "pointer" }}/>
            </div>
            <div className="nav-links"></div>
            {userId ? (
                <div className="navMenu" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setShowMenu((prev) => !prev)} tabIndex={0} title="Profile menu">
                    <List size={32} color={"#fff"} weight="bold"/>
                </div>
            ) : (
                <div className="flex gap-4 ml-auto mr-11">
                    <button className="login-button "
                        onClick={() => navigate("/login")}>
                        Login
                    </button>
                    <button className="signup-button text-white border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-5"
                        onClick={() => navigate("/signup")}>
                        Sign Up
                    </button>
                </div>
            )}
            {showMenu && userId && (
                <div className="nav-dropdown">
                    <button className="dropdown-item " onClick={() => { setShowMenu(false); navigate("/"); }}>Home</button>
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/dashboard"); }}>Dashboard</button>

                    {/* Tutor only */}
                    {role === "Tutor" && (
                        <>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/lessonrequests"); }}>Lesson Requests</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/studentfiles"); }}>Student Files</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/lessonfeedback"); }}>Lesson Feedback</button>
                        </>
                    )}
                    {/* Admin only */}
                    {role === "Admin" && (
                        <>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/addstaff"); }}>Add Staff</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/manageusers"); }}>Manage Users</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/studentrequests"); }}>Student Requests</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/userexperiencefeedback"); }}>User Experience Feedback</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/managereports"); }}>Manage Reports</button>
                        </>
                    )}
                    {/* Student only */}
                    {role === "Student" && (
                        <>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/booking"); }}>Book Lessons</button>
                            <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/requestform"); }}>Request Form</button>
                        </>
                    )}
                    <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/userprofile"); }}>My Profile</button>
                    <button className="dropdown-item text-red-600 hover:text-blue-50 hover:font-semibold transition-colors"
                        onClick={() => {
                            setShowMenu(false);
                            localStorage.removeItem("userID");
                            navigate("/login");
                        }}>
                        Log out
                    </button>
                </div>
            )}   
        </nav>
    );
}

export default Navbar;