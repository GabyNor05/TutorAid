import React, { useState, useEffect } from "react";
import "./css/dashboard.css";
import { useNavigate} from "react-router-dom";
import Clock from "./assets/clock.svg";
import People from "./assets/people.svg";
import Task from "./assets/task.svg";
import LessonCards from "../generalComponents/lessonCards";
import { File, ClipboardText, UserCirclePlusIcon, WarningIcon, Calendar, NoteIcon, } from "@phosphor-icons/react";
import axios from "axios";


function Dashboard() {
    const [role, setRole] = useState(null);
    const [acceptedLessons, setAcceptedLessons] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId) {
            axios.get(`http://localhost:5000/api/users/${userId}`)
                .then(res => setRole(res.data.role))
                .catch(err => setRole(null));
        }
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId && role) {
            axios.get(`http://localhost:5000/api/lessons/accepted?userID=${userId}&role=${role}`)
                .then(res => setAcceptedLessons(Array.isArray(res.data) ? res.data : []))
                .catch(() => setAcceptedLessons([]));
        }
    }, [role]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="page-background"> 
            <div className="pt-2 text-center">
                <h1 className="page-title">Welcome to your dashboard</h1>  
            </div>

            <div className="dashboard-navigation">
                
                    {role === "Tutor" && (
                        <>
                            <div className="navcard-row">
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/lessonrequests")}>
                                    <div className="navcard-content">
                                        <img src={Clock} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                        <div className="navcard-text -bottom-3 ">
                                            <h2>Lesson Requests</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/studentfiles")}>
                                    <div className="navcard-content">
                                        <img src={People} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                        <div className="navcard-text -bottom-3">
                                            <h2>Student Profiles</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/lessonfeedback")}>
                                    <div className="navcard-content">
                                        <img src={Task} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                        <div className="navcard-text -bottom-3 ">
                                            <h2>Lesson Feedback</h2>
                                        </div>
                                    </div>
                                </button>
                            </div>                           
                        </>
                    )}
                    {role === "Admin" && (
                        <>
                            <div className="navcard-row">
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/addstaff")}>
                                <div className="navcard-content">
                                    <UserCirclePlusIcon size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Add Staff</h2>
                                    </div>
                                </div>

                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/manageusers")}>
                                    <div className="navcard-content">
                                        <img src={People} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                        <div className="navcard-text -bottom-3">
                                            <h2>Manage Users</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/studentrequests")}>
                                    <div className="navcard-content">
                                        <File size={120} className="navcard-icon opacity-30"/>
                                        <div className="navcard-text -bottom-3">
                                            <h2>Student Requests</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/lessonrequests")}>
                                    <div className="navcard-content">
                                        <ClipboardText size={120} className="navcard-icon opacity-30"/>
                                        <div className="navcard-text -bottom-3">
                                            <h2>User Experience Feedback</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard-red transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 bg-gradient-to-r from-red-950 via-red-800  to-red-600 relative" onClick={() => handleNavigation("/lessonrequests")}>
                                    <div className="navcard-content">
                                        <WarningIcon size={120} className="navcard-icon opacity-30"/>
                                        <div className="navcard-text -bottom-3">
                                            <h2>Manage Reports</h2>
                                        </div>
                                    </div>
                                </button>
                            </div>   
                        </>
                    )}
                    {role === "Student" && (
                        <>
                            <div className="navcard-row">
                               <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/booking")}>
                                <div className="navcard-content">
                                    
                                    <Calendar size={120} className="navcard-icon opacity-30"/>
                                <div className="navcard-text -bottom-3">
                                    <h2>Book Lessons</h2>
                                </div>
                                </div>
                                
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/requestform")}>
                                    <div className="navcard-content">
                                        <img src={People} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                        <div className="navcard-text -bottom-3">
                                            <h2>Request Form</h2>
                                        </div>
                                    </div>
                                </button>
                            </div> 
                        </>
                    )}   
            </div>
            {(role === "Tutor" || role === "Student") && (
    <div className="upcoming-lessons" style={{paddingTop: "15px"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "left", justifyContent: "left", gap: "20px", paddingBottom: "30px", width: "1000px", margin: "0 auto"}}>
            <h1 className="section-title" style={{display: "flex", justifyContent: "left", margin: "20px"}}>Upcoming Lessons</h1>
            <div style={{display: "flex", flexDirection: "column", alignItems: "left", justifyContent: "left", gap: "20px", paddingBottom: "30px"}}>
                {acceptedLessons.length === 0 ? (
                    <p style={{marginLeft: "20px", color: "#fff"}}>No upcoming lessons scheduled.</p>
                ) : (
                    acceptedLessons.map(lesson => (
                        <LessonCards
                            key={lesson.lessonID}
                            lesson={lesson}
                            showStatus={false}
                        />
                    ))
                )}
            </div>  
        </div>
    </div>
)}
        </div>
        
    );
}

export default Dashboard;