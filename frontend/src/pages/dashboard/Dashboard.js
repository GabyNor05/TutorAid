import React, { useState, useEffect } from "react";
import "./css/dashboard.css";
import { useNavigate } from "react-router-dom";
import Clock from "./assets/clock.svg";
import People from "./assets/people.svg";
import Task from "./assets/task.svg";
import LessonCards from "../generalComponents/lessonCards";
import { File, ClipboardText, UserCirclePlusIcon, WarningIcon, Calendar, NotePencil, UsersThree, ClockCountdown, QuestionMark, ListChecks, ChatText, Megaphone, Clipboard, Calandar, List, UserList, Newspaper } from "@phosphor-icons/react";
import { api, endpoints } from "../../api/client";


function Dashboard() {
    const [role, setRole] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedTutorUserID, setSelectedTutorUserID] = useState(null); // ADD: tutor's userID
    const [ratingValue, setRatingValue] = useState("");
    const [ratingComment, setRatingComment] = useState("");
    const [contactSubject, setContactSubject] = useState("");
    const [contactBody, setContactBody] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId) {
            api.get(endpoints.userById(userId))
                .then(res => setRole(res.role))
                .catch(() => setRole(null));
        }
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (userId && role) {
            const r = String(role).toLowerCase();
            const base = endpoints.lessons();
            const url = r === 'student'
              ? `${base}?userID=${userId}&role=${role}`        // all lessons for student
              : `${base}/accepted?userID=${userId}&role=${role}`; // keep accepted for tutor
            api.get(url)
               .then(res => setLessons(Array.isArray(res) ? res : []))
               .catch(() => setLessons([]));
        }
    }, [role]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleRateSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userID");
        const response = await api.get(endpoints.studentByUser(userId));
        const studentID = response.studentID;
        try {
            await api.post(endpoints.ratings(), {
                tutorID: selectedTutor,
                studentID,
                rating: ratingValue,
                comment: ratingComment
            });
            setRateModalOpen(false);
            setRatingValue("");
            setRatingComment("");
        } catch (err) {
            // handle error UI if needed
        }
    };

    // Helper to resolve tutor.userID from tutorID
    const resolveTutorUserID = async (tutorID) => {
        try {
            const tutor = await api.get(endpoints.tutorById(tutorID));
            const uid = tutor?.userID ? Number(tutor.userID) : null;
            setSelectedTutorUserID(uid);
            return uid;
        } catch (e) {
            console.warn("Could not fetch /api/tutors/:id", e?.message || e);
            setSelectedTutorUserID(null);
            return null;
        }
    };

    const handleSendPrivateMessage = async (e) => {
        e.preventDefault();
        if (!selectedTutor || !contactBody.trim()) return;
        try {
            const userId = localStorage.getItem("userID");
            const senderUserID = Number(userId || 0); // simplify: Users.userID from localStorage
            if (!senderUserID) throw new Error("Could not resolve sender userID");

            // Resolve tutor's Users.userID (receiver)
            const tutorRow = await api.get(endpoints.tutorById(selectedTutor));
            let receiverUserID = Number(tutorRow?.userID || 0);
            if (!receiverUserID) throw new Error("Could not resolve tutor userID");

            await api.post(endpoints.messages(), {
                type: "Private Message",
                subject: contactSubject,
                body: contactBody,
                senderID: senderUserID,     // Users.userID student
                receiverID: receiverUserID, // Users.userID tutor
            });

            setContactModalOpen(false);
            setContactSubject("");
            setContactBody("");
        } catch (err) {
            console.error("Send message failed:", err);

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
                            <button className="navpill" onClick={() => handleNavigation("/lessonrequests")}> <ClockCountdown size={24} className="opacity-30 mr-2" /> Lesson Requests</button>
                            <button className="navpill" onClick={() => handleNavigation("/studentfiles")}> <UsersThree size={24} className="opacity-30 mr-2" /> Student Profiles</button>
                            <button className="navpill" onClick={() => handleNavigation("/lessonfeedback")}> <ChatText size={24} className="opacity-30 mr-2" /> Lesson Feedback</button>
                            <button className="navpill" onClick={() => handleNavigation("/userfeedback")}> <ClipboardText size={24} className="opacity-30 mr-2" /> User Feedback Form</button>
                        </div>
                    </div>

                    {/* Desktop: keep your current navcards */}
                    <div className="hidden md:flex dashboard-navigation">

                        {role === "Tutor" && (
                            <>
                                <div className="navcard-row">
                                    <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/lessonrequests")}>
                                        <div className="navcard-content">
                                            <ClockCountdown size={120} className="navcard-icon opacity-30" />
                                            <div className="navcard-text -bottom-3 ">
                                                <h2>Lesson Requests</h2>
                                            </div>
                                        </div>
                                    </button>
                                    <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/studentfiles")}>
                                        <div className="navcard-content">
                                            <UsersThree size={120} className="navcard-icon opacity-30" />
                                            <div className="navcard-text -bottom-3">
                                                <h2>Student Profiles</h2>
                                            </div>
                                        </div>
                                    </button>
                                    <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/lessonfeedback")}>
                                        <div className="navcard-content">
                                            <ChatText size={120} className="navcard-icon opacity-30" />
                                            <div className="navcard-text -bottom-3 ">
                                                <h2>Lesson Feedback</h2>
                                            </div>
                                        </div>
                                    </button>
                                    <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/userfeedback")}>
                                        <div className="navcard-content">
                                            <ClipboardText size={120} className="navcard-icon opacity-30" />
                                            <div className="navcard-text -bottom-3">
                                                <h2>User Feedback Form</h2>
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
                    <div className="flex flex-col items-center md:hidden w-2/3 px-4">
                        <div className="mobile-nav-list">
                            <button className="navpill" onClick={() => handleNavigation("/addstaff")}><UserCirclePlusIcon size={24} className="opacity-30 mr-2" /> Add Staff</button>
                            <button className="navpill" onClick={() => handleNavigation("/manageusers")}><UserList size={24} className="opacity-30 mr-2" /> Manage Users</button>
                            <button className="navpill" onClick={() => handleNavigation("/studentrequests")}><ListChecks size={24} className="opacity-30 mr-2" /> Manage Requests</button>
                            <button className="navpill" onClick={() => handleNavigation("/newsletter")}><Newspaper size={24} className="opacity-30 mr-2" /> Newsletter</button>
                            <button className="navpill" onClick={() => handleNavigation("/managefeedback")}><ClipboardText size={24} className="opacity-30 mr-2" /> Manage User Feedback</button>
                            <button className="navpill navpill-red" onClick={() => handleNavigation("/managereports")}><Megaphone size={24} className="opacity-30 mr-2" /> Manage Reports</button>
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
                                    <UserList size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Manage Users</h2>
                                    </div>
                                </div>
                            </button>
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/studentrequests")}>
                                <div className="navcard-content">
                                    <ListChecks size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Manage Requests</h2>
                                    </div>
                                </div>
                            </button>
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/newsletter")}>
                                <div className="navcard-content">
                                    <Newspaper size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Newsletter</h2>
                                    </div>
                                </div>
                            </button>
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/managefeedback")}>
                                <div className="navcard-content">
                                    <ClipboardText size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Manage User Feedback</h2>
                                    </div>
                                </div>
                            </button>
                            <button className="navcard-red transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 bg-gradient-to-r from-red-950 via-red-800  to-red-600 relative" onClick={() => handleNavigation("/managereports")}>
                                <div className="navcard-content">
                                    <Megaphone size={120} className="navcard-icon opacity-30" />
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
                            <button className="navpill" onClick={() => handleNavigation("/booking")}><Calendar size={24} className="opacity-30 mr-2" />Book Lessons</button>
                            <button className="navpill" onClick={() => handleNavigation("/requestform")}><QuestionMark size={24} className="opacity-30 mr-2" />Request Form</button>
                            <button className="navpill" onClick={() => handleNavigation("/userfeedback")}><ClipboardText size={24} className="opacity-30 mr-2" />User Feedback Form</button>
                        </div>
                    </div>

                    <div className="hidden md:flex dashboard-navigation">
                        <div className="navcard-row">
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/booking")}>
                                <div className="navcard-content">

                                    <Calendar size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Book Lessons</h2>
                                    </div>
                                </div>

                            </button>
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/requestform")}>
                                <div className="navcard-content">
                                    <QuestionMark size={120} className="navcard-icon opacity-30" />
                                    <div className="navcard-text -bottom-3">
                                        <h2>Request Form</h2>
                                    </div>
                                </div>
                            </button>
                            <button className="navcard transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative" onClick={() => handleNavigation("/userfeedback")}>
                                        <div className="navcard-content">
                                            <ClipboardText size={120} className="navcard-icon opacity-30" />
                                            <div className="navcard-text -bottom-3">
                                                <h2>User Feedback Form</h2>
                                            </div>
                                        </div>
                                    </button>
                        </div>
                    </div>
                </>
            )}
            {(role === "Tutor" || role === "Student") && (
                <div className="upcoming-lessons pt-4 sm:pt-5">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <h1 className="section-title text-white text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4">
                            Upcoming Lessons
                        </h1>

                        {lessons.length === 0 ? (
                            <p className="text-white/90">No lessons scheduled.</p>
                        ) : (
                            <div className="flex flex-col gap-4 sm:gap-6 pb-6">
                                {lessons.map(lesson => (
                                    <LessonCards
                                        key={lesson.lessonID}
                                        lesson={lesson}
                                        role={role}
                                        tutorImage={lesson.tutorImage}
                                        tutorName={lesson.tutorName}
                                        showStatus={role === "Tutor"} // only tutor sees accept/decline
                                        onContactTutor={() => {
                                            setSelectedTutor(lesson.tutorID);
                                            resolveTutorUserID(lesson.tutorID);
                                            setContactModalOpen(true);
                                        }}
                                        onRateTutor={() => {
                                            setSelectedTutor(lesson.tutorID);
                                            resolveTutorUserID(lesson.tutorID);
                                            setRateModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {contactModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-4">Contact Tutor</h3>
                        <form onSubmit={handleSendPrivateMessage}>
                            <input
                                type="text"
                                placeholder="Subject"
                                className="w-full border rounded p-2 mb-2"
                                value={contactSubject}
                                onChange={(e) => setContactSubject(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Message"
                                className="w-full border rounded p-2 mb-2"
                                rows={4}
                                value={contactBody}
                                onChange={(e) => setContactBody(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="submit" className="px-4 py-2 rounded bg-[#2B5561] text-white">Send</button>
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
                                {[1, 2, 3, 4, 5].map(num => (
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
                                <button type="submit" className="px-4 py-2 rounded bg-[#2B5561] text-white">Submit</button>
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