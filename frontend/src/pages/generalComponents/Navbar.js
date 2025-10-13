import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, EnvelopeSimple } from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";
import axios from "axios";
import MessageCard from "./MessageCard";

function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [role, setRole] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const navigate = useNavigate();
    const userId = localStorage.getItem("userID");
    const [inboxOpen, setInboxOpen] = useState(false); // Add this

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/users/${userId}`)
                .then(res => setRole(res.data.role))
                .catch(err => setRole(null));
        }
    }, [userId]);

    useEffect(() => {
        if (userId && inboxOpen) {
            axios.get(`http://localhost:5000/api/messages/inbox/${userId}`)
                .then(res => setMessages(res.data))
                .catch(() => setMessages([]));
        }
    }, [userId, inboxOpen]);

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
            {userId && (
                <div
                    className="fixed bottom-6 right-6 z-50 bg-[#] rounded-full shadow-lg flex items-center justify-center cursor-pointer w-16 h-16 hover:bg-cyan-700 transition"
                    onClick={() => setInboxOpen(true)}
                    title="Inbox"
                >
                    <EnvelopeSimple size={32} color="#fff" weight="bold" />
                    {/* Optionally add a badge for unread count */}
                    {/* <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2">3</span> */}
                </div>
            )}
            {inboxOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[100]">
                    <div className="bg-white rounded-2xl shadow-lg w-5/6 h-[600px] max-w-full p-0 relative flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b h-15">
                            <h2 className="text-xl font-bold text-cyan-700">
                                Inbox <span className="text-gray-500">({messages.length})</span>
                            </h2>
                            <button
                                className="text-center justify-center text-gray-500 hover:text-gray-700 text-4xl"
                                onClick={() => setInboxOpen(false)}
                                title="Close"
                            >
                                &times;
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-2 px-6 py-2 border-b bg-gray-50">
                            <button
                                className={`px-3 py-1 rounded-full font-semibold text-sm ${activeTab === "all" ? "bg-cyan-100 text-cyan-700" : "text-gray-500"}`}
                                onClick={() => setActiveTab("all")}
                            >
                                All messages
                            </button>
                            <button
                                className={`px-3 py-1 rounded-full font-semibold text-sm ${activeTab === "unread" ? "bg-cyan-100 text-cyan-700" : "text-gray-500"}`}
                                onClick={() => setActiveTab("unread")}
                            >
                                Unread({messages.filter(m => !m.isRead).length})
                            </button>
                            <button className="px-3 py-1 rounded-full text-gray-500 font-semibold text-sm">Archived</button>
                            <button className="px-3 py-1 rounded-full text-gray-500 font-semibold text-sm">Draft</button>
                        </div>
                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto bg-white px-2 py-2">
                            {activeTab === "all" ? (
                                messages.length === 0 ? (
                                    <div className="text-center text-gray-400 mt-10">No messages</div>
                                ) : (
                                    messages.map(msg => (
                                        <MessageCard
                                            key={msg.messageID}
                                            senderID={msg.senderID}
                                            time={msg.sentAt}
                                            message={msg.body}
                                            unread={!msg.isRead}
                                            online={false}
                                            subject={msg.subject}
                                        />
                                    ))
                                )
                            ) : activeTab === "unread" ? (
                                messages.filter(msg => !msg.isRead).length === 0 ? (
                                    <div className="text-center text-gray-400 mt-10">No unread messages</div>
                                ) : (
                                    messages.filter(msg => !msg.isRead).map(msg => (
                                        <MessageCard
                                            key={msg.messageID}
                                            senderID={msg.senderID}
                                            time={msg.sentAt}
                                            message={msg.body}
                                            unread={true}
                                            online={false}
                                            subject={msg.subject}
                                        />
                                    ))
                                )
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;