import React from "react";
import "./css/dashboard.css";
import { useNavigate } from "react-router-dom";
import Clock from "./assets/clock.svg";
import People from "./assets/people.svg";
import Task from "./assets/task.svg";
import LessonCards from "../generalComponents/lessonCards";

function Dashboard() {
    const navigate = useNavigate();
    // Replace this with your actual role logic (e.g., from context, Redux, or props)
    const role = "tutor"; // "tutor", "admin", or "student"

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="page-background"> 
            <div className="pt-2 text-center">
                <h1 className="page-title">Welcome to your dashboard</h1>  
            </div>

            <div className="dashboard-navigation">
                
                    {role === "tutor" && (
                        <>
                            <div className="navcard-row">
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/lessonrequests")}>
                                <img src={Clock} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                <div className="navcard-text">
                                    <h2>Lesson Requests</h2>
                                </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/studentprofiles")}>
                                    <img src={People} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                    <div className="navcard-text">
                                    <h2>Student Profiles</h2>
                                    </div>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/lessonlogs")}>
                                    <img src={Task} className = "navcard-icon" alt="Clock Icon" style={{ width: "120px", height: "120px", marginBottom: "10px" }} />
                                    <div className="navcard-text">
                                    <h2>Lesson Logs</h2>
                                    </div>
                                </button>
                            </div>                           
                        </>
                    )}
                    {role === "admin" && (
                        <>
                            <div className="navcard-row">
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/reports")}>
                                <h2>Reports</h2>
                                <p>View system reports.</p>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/feedbackrequests")}>
                                    <h2>Feedback Requests</h2>
                                    <p>Manage feedback requests.</p>
                                </button>
                            </div>   
                        </>
                    )}
                    {role === "student" && (
                        <>
                            <div className="navcard-row">
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/booking")}>
                                <h2>Booking</h2>
                                <p>Book your lessons here.</p>
                                </button>
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => handleNavigation("/feedbackform")}>
                                    <h2>Feedback Request Form</h2>
                                    <p>Submit your feedback requests.</p>
                                </button>
                            </div>
                            
                        </>
                    )}   
            </div>
            <div className="upcoming-lessons" style={{paddingTop: "15px"}}>
                {role === "tutor" && (
                    <div >
                        <h1 className="section-title" style={{marginLeft: "290px"}}>Upcoming Lessons</h1>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", paddingBottom: "30px"}}>
                            <LessonCards image= "https://via.placeholder.com/150" name = "Bo Fin Arvin" date = "2025-09-25" time = "14:00" address = "321 Corner of Fae and Lewis" subject = "History"/>
                            <LessonCards image ="https://via.placeholder.com/150" name = "Lauren Lewis" date = "2025-09-21" time = "10:00" address = "123 Main St" subject = "Math"/>
                            <LessonCards image ="https://via.placeholder.com/150" name = "Kenzi Solo" date = "2025-09-22" time = "17:00" address = "456 Elm St" subject = "Science"/> 
                        </div>  
                    </div>
                    )}
            </div>
        </div>
        
    );
}

export default Dashboard;