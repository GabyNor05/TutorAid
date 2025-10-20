import React, { useState, useEffect } from "react";
import "./css/dashboard.css";
import { useNavigate} from "react-router-dom";
import Clock from "./assets/clock.svg";
import People from "./assets/people.svg";
import Task from "./assets/task.svg";
import LessonCards from "../generalComponents/lessonCards";
import { File, ClipboardText, UserCirclePlusIcon, WarningIcon, Calendar, NoteIcon, } from "@phosphor-icons/react";
import axios from "axios";
import { useSEO } from '../../lib/seo';


function Dashboard() {
    const [role, setRole] = useState(null);
    const [acceptedLessons, setAcceptedLessons] = useState([]);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [ratingValue, setRatingValue] = useState("");
    const [ratingComment, setRatingComment] = useState("");
    const navigate = useNavigate();
    const API_URL =  process.env.REACT_APP_API_URL;  

    useSEO({
        title: 'Tutor Aid — Dashboard',
        description: 'University Project: Access your personalized dashboard to manage lessons, tutors, and more on Tutor Aid.',
        canonical: 'https://gabydv.xyz/dashboard',
    });

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId) {
            axios.get(`${API_URL}/api/users/${userId}`)
                .then(res => setRole(res.data.role))
                .catch(err => setRole(null));
        }
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId && role) {
            axios.get(`${API_URL}/api/lessons/accepted?userID=${userId}&role=${role}`)
                .then(res => setAcceptedLessons(Array.isArray(res.data) ? res.data : []))
                .catch(() => setAcceptedLessons([]));
        }
    }, [role]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleRateSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userID");
        const response = await axios.get(`${API_URL}/api/students/by-user/${userId}`);
        const studentID = response.data.studentID;
        try {
            await axios.post(`${API_URL}/api/ratings`, {
                tutorID: selectedTutor,
                studentID: studentID,
                rating: ratingValue,
                comment: ratingComment
            });
            setRateModalOpen(false);
            setRatingValue("");
            setRatingComment("");
            // Optionally show a success message
        } catch (err) {
            // Optionally show an error message
        }
    };

    return (
        <div className="page-background"> 
            <div className="pt-2 text-center">
                <h1 className="page-title">Welcome to your dashboard</h1>  
            </div>

            {role === "Tutor" && (
  <>
    {/* Mobile: text-only pills */}
    <div className="md:hidden w-full px-4">
      <div className="mobile-nav-list">
        <button className="navpill" onClick={() => handleNavigation("/lessonrequests")}>Lesson Requests</button>
        <button className="navpill" onClick={() => handleNavigation("/studentfiles")}>Student Profiles</button>
        <button className="navpill" onClick={() => handleNavigation("/lessonfeedback")}>Lesson Feedback</button>
      </div>
    </div>

    {/* Desktop: keep your current navcards */}
    <div className="hidden md:flex dashboard-navigation">
                
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
            </div>
  </>
)}
                    {role === "Admin" && (
  <>
    <div className="md:hidden w-full px-4">
      <div className="mobile-nav-list">
        <button className="navpill" onClick={() => handleNavigation("/addstaff")}>Add Staff</button>
        <button className="navpill" onClick={() => handleNavigation("/manageusers")}>Manage Users</button>
        <button className="navpill" onClick={() => handleNavigation("/studentrequests")}>Student Requests</button>
        <button className="navpill" onClick={() => handleNavigation("/userexperiencefeedback")}>User Experience Feedback</button>
        <button className="navpill navpill-red" onClick={() => handleNavigation("/managereports")}>Manage Reports</button>
      </div>
    </div>

    <div className="hidden md:flex dashboard-navigation">
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
                                <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/userexperiencefeedback")}>
                                    <div className="navcard-content">
                                        <ClipboardText size={120} className="navcard-icon opacity-30"/>
                                        <div className="navcard-text -bottom-3">
                                            <h2>User Experience Feedback</h2>
                                        </div>
                                    </div>
                                </button>
                                <button className="navcard-red transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 bg-gradient-to-r from-red-950 via-red-800  to-red-600 relative" onClick={() => handleNavigation("/managereports")}>
                                    <div className="navcard-content">
                                        <WarningIcon size={120} className="navcard-icon opacity-30"/>
                                        <div className="navcard-text -bottom-3">
                                            <h2>Manage Reports</h2>
                                        </div>
                                    </div>
                                </button>
                            </div>   
                        </div>
  </>
)}
                    {role === "Student" && (
  <>
    <div className="md:hidden w-full px-4">
      <div className="mobile-nav-list">
        <button className="navpill" onClick={() => handleNavigation("/booking")}>Book Lessons</button>
        <button className="navpill" onClick={() => handleNavigation("/requestform")}>Request Form</button>
      </div>
    </div>

    <div className="hidden md:flex dashboard-navigation">
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
                        </div>
  </>
)}
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
                            role={role}
                            tutorImage={lesson.tutorImage}   // should be set from backend
                            tutorName={lesson.tutorName}     // should be set from backend
                            showStatus={false}
                            onContactTutor={() => {
                                setSelectedTutor(lesson.tutorID);
                                setContactModalOpen(true);
                            }}
                            onRateTutor={() => {
                                setSelectedTutor(lesson.tutorID);
                                setRateModalOpen(true);
                            }}
                        />
                    ))
                )}
            </div>  
        </div>
    </div>
)}
            {contactModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Contact Tutor</h3>
      <form>
        <input type="text" placeholder="Subject" className="w-full border rounded p-2 mb-2" />
        <textarea placeholder="Message" className="w-full border rounded p-2 mb-2" rows={4} />
        <div className="flex justify-end gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-cyan-600 text-white">Send</button>
          <button type="button" className="px-4 py-2 rounded bg-gray-300" onClick={() => setContactModalOpen(false)}>Cancel</button>
          
        </div>
      </form>
    </div>
  </div>
)}
{rateModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Rate Tutor</h3>
      <form onSubmit={handleRateSubmit}>
    <label className="block mb-2">Rating:</label>
    <select
        className="w-full border rounded p-2 mb-2"
        value={ratingValue}
        onChange={e => setRatingValue(e.target.value)}
        required
    >
        <option value="">Select rating</option>
        {[1,2,3,4,5].map(num => (
            <option key={num} value={num}>{num} Star{num > 1 ? "s" : ""}</option>
        ))}
    </select>
    <textarea
        placeholder="Comment"
        className="w-full border rounded p-2 mb-2"
        rows={4}
        value={ratingComment}
        onChange={e => setRatingComment(e.target.value)}
        required
    />
    <div className="flex justify-end gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-yellow-500 text-white">Submit</button>
        <button type="button" className="px-4 py-2 rounded bg-gray-300" onClick={() => setRateModalOpen(false)}>Cancel</button>
    </div>
</form>
    </div>
  </div>
)}
        </div>
        
    );
}

export default Dashboard;