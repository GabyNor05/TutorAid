import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, EnvelopeSimple, X } from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";
import axios from "axios";
import MessageCard from "./MessageCard";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);      // desktop profile menu
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile nav menu
  const [role, setRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [inboxOpen, setInboxOpen] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userID");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_URL}/api/users/${userId}`)
        .then((res) => setRole(res.data.role))
        .catch(() => setRole(null));
    }
  }, [userId]);

  useEffect(() => {
    if (userId && inboxOpen) {
      axios
        .get(`${API_URL}/api/messages/inbox/${userId}`)
        .then((res) => setMessages(res.data))
        .catch(() => setMessages([]));
    }
  }, [userId, inboxOpen]);

  const handleNav = (path) => {
    setShowMenu(false);
    setMobileOpen(false);
    navigate(path);
  };

  const RoleLinks = () => (
    <>
      {role === "Tutor" && (
        <>
          <button className="dropdown-item" onClick={() => handleNav("/lessonrequests")}>Lesson Requests</button>
          <button className="dropdown-item" onClick={() => handleNav("/studentfiles")}>Student Files</button>
          <button className="dropdown-item" onClick={() => handleNav("/lessonfeedback")}>Lesson Feedback</button>
        </>
      )}
      {role === "Admin" && (
        <>
          <button className="dropdown-item" onClick={() => handleNav("/addstaff")}>Add Staff</button>
          <button className="dropdown-item" onClick={() => handleNav("/manageusers")}>Manage Users</button>
          <button className="dropdown-item" onClick={() => handleNav("/studentrequests")}>Student Requests</button>
          <button className="dropdown-item" onClick={() => handleNav("/userexperiencefeedback")}>User Experience Feedback</button>
          <button className="dropdown-item" onClick={() => handleNav("/managereports")}>Manage Reports</button>
        </>
      )}
      {role === "Student" && (
        <>
          <button className="dropdown-item" onClick={() => handleNav("/booking")}>Book Lessons</button>
          <button className="dropdown-item" onClick={() => handleNav("/requestform")}>Request Form</button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#2B5561] text-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="TutorAid"
            className="h-10 w-auto cursor-pointer"
            onClick={() => handleNav("/dashboard")}
          />
        </div>

        {/* Right: Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          {userId ? (
            <>
              {/* Inbox button */}
              <button
                className="relative rounded-full p-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={() => setInboxOpen(true)}
                title="Inbox"
              >
                <EnvelopeSimple size={24} weight="bold" />
              </button>

              {/* Profile menu trigger */}
              <button
                className="rounded-md px-3 py-2 bg-cyan-600 hover:bg-cyan-500 font-semibold"
                onClick={() => setShowMenu((p) => !p)}
                aria-haspopup="menu"
                aria-expanded={showMenu}
                title="Profile menu"
              >
                <List size={24} weight="bold" />
              </button>

              {/* Dropdown */}
              {showMenu && (
                <div
                  className="absolute right-4 top-16 w-56 bg-white text-gray-800 rounded-md shadow-lg py-2"
                  role="menu"
                >
                  <button className="dropdown-item" onClick={() => handleNav("/")}>Home</button>
                  <button className="dropdown-item" onClick={() => handleNav("/dashboard")}>Dashboard</button>
                  <RoleLinks />
                  <button className="dropdown-item" onClick={() => handleNav("/userprofile")}>My Profile</button>
                  <button
                    className="dropdown-item text-red-600 hover:bg-red-50"
                    onClick={() => {
                      localStorage.removeItem("userID");
                      handleNav("/login");
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="login-button text-white px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-2 sm:mt-0"
                onClick={() => handleNav("/login")}
              >
                Login
              </button>
              <button
                className="signup-button text-white border border-yellow-400 px-4 py-2 rounded-md font-semibold hover:bg-yellow-500 hover:border-yellow-500"
                onClick={() => handleNav("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {userId && (
            <button
              className="rounded-full p-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={() => setInboxOpen(true)}
              title="Inbox"
            >
              <EnvelopeSimple size={24} weight="bold" />
            </button>
          )}
          <button
            className="rounded-md p-2 bg-cyan-600 hover:bg-cyan-500"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <List size={24} weight="bold" />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white text-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <span className="font-bold text-cyan-700">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {userId ? (
                <>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/")}>Home</button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/dashboard")}>Dashboard</button>
                  {/* Role-specific */}
                  <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">Shortcuts</div>
                  {/* Reuse links */}
                  <div className="flex flex-col">
                    {role === "Tutor" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/lessonrequests")}>Lesson Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/studentfiles")}>Student Files</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/lessonfeedback")}>Lesson Feedback</button>
                      </>
                    )}
                    {role === "Admin" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/addstaff")}>Add Staff</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/manageusers")}>Manage Users</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/studentrequests")}>Student Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/userexperiencefeedback")}>User Experience Feedback</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/managereports")}>Manage Reports</button>
                      </>
                    )}
                    {role === "Student" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/booking")}>Book Lessons</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/requestform")}>Request Form</button>
                      </>
                    )}
                  </div>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/userprofile")}>My Profile</button>
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600"
                    onClick={() => {
                      localStorage.removeItem("userID");
                      handleNav("/login");
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="p-3 flex flex-col gap-2">
                  <button className="w-full px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-500" onClick={() => handleNav("/login")}>
                    Login
                  </button>
                  <button className="w-full px-4 py-2 rounded-md border border-yellow-500 text-cyan-700 font-semibold hover:bg-yellow-500 hover:text-white" onClick={() => handleNav("/signup")}>
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inbox FAB (responsive sizes) */}
      {userId && (
        <button
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 rounded-full bg-cyan-700 hover:bg-cyan-800 shadow-lg w-12 h-12 md:w-16 md:h-16 flex items-center justify-center"
          onClick={() => setInboxOpen(true)}
          title="Inbox"
        >
          <EnvelopeSimple size={28} className="md:hidden" />
          <EnvelopeSimple size={32} className="hidden md:block" />
        </button>
      )}

      {/* Inbox Modal (unchanged structure; styling kept responsive) */}
      {inboxOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full h-[80vh] max-w-5xl p-0 relative flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-cyan-700">
                Inbox <span className="text-gray-500">({messages.length})</span>
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setInboxOpen(false)}
                title="Close"
              >
                &times;
              </button>
            </div>
            <div className="flex gap-2 px-4 sm:px-6 py-2 border-b bg-gray-50">
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
                Unread ({messages.filter((m) => !m.isRead).length})
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white px-2 py-2">
              {activeTab === "all" ? (
                messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">No messages</div>
                ) : (
                  messages.map((msg) => (
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
              ) : messages.filter((m) => !m.isRead).length === 0 ? (
                <div className="text-center text-gray-400 mt-10">No unread messages</div>
              ) : (
                messages
                  .filter((m) => !m.isRead)
                  .map((msg) => (
                    <MessageCard
                      key={msg.messageID}
                      senderID={msg.senderID}
                      time={msg.sentAt}
                      message={msg.body}
                      unread
                      online={false}
                      subject={msg.subject}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;