import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { List, EnvelopeSimple, X, House, User, SquaresFour, SignOut, UserPlus, File, ClipboardText, UserCirclePlusIcon, WarningIcon, Calendar, NotePencil, UsersThree, ClockCountdown, QuestionMark, ListChecks, ChatText, Megaphone, Clipboard, List, Calendar} from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";
import MessageCard from "./MessageCard";
import { api, endpoints } from "../../api/client";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);      // desktop profile menu
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile nav menu
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 
  const [inboxOpen, setInboxOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 

  const userId = localStorage.getItem("userID");

  useEffect(() => {
    if (userId) {
      api
        .get(endpoints.userById(userId))
        .then((res) => {
          setRole(res.role);
          setUser(res);
        })
        .catch(() => {
          setRole(null);
          setUser(null);
        });
    }
  }, [userId]);

  useEffect(() => {
    if (userId && inboxOpen) {
      api
        .get(endpoints.messagesInbox(userId))
        .then((res) => setMessages(res))
        .catch(() => setMessages([]));
    }
  }, [userId, inboxOpen]);

  useEffect(() => {
    // Close profile menu on outside click or ESC
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setMobileOpen(false);
      }
    };
    const onClick = (e) => {
      if (showMenu && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showMenu]);

  const handleNav = (path) => {
    setShowMenu(false);       // keep in sync
    setMobileOpen(false);     // keep in sync
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

  // Helper: build tabs per role
  const buildTabs = () => {
    const unreadCount = messages.filter(m => !m.isRead).length;
    const base = [
      { key: "all", label: "All messages" },
      { key: "unread", label: `Unread (${unreadCount})` },
    ];
    if (role === "Student") {
      return [
        ...base,
        { key: "private", label: "Private Messages" },
        { key: "lesson-updates", label: "Lesson Updates" },
        { key: "progress-updates", label: "Progress Notes Updates" },
        { key: "request-responses", label: "Request Responses" },
        { key: "warnings", label: "Warnings" },
      ];
    }
    if (role === "Tutor") {
      return [
        ...base,
        { key: "private", label: "Private Messages" },
        { key: "lesson-requests", label: "Lesson Requests" },
      ];
    }
    if (role === "Admin") {
      return [
        ...base,
        { key: "student-requests", label: "Student Requests" },
        { key: "reports", label: "Reports" },
        { key: "warnings", label: "Warnings" },
      ];
    }
    return base;
  };

  // Helper: filter messages by tab (subject-based categorization)
  const filterByTab = (tabKey) => {
    const list = messages || [];
    if (tabKey === "all") return list;
    if (tabKey === "unread") return list.filter(m => !m.isRead);

    const subj = (s) => String(s || "").toLowerCase();

    switch (tabKey) {
      case "private":
        return list.filter(m => subj(m.subject).includes("private message"));
      case "lesson-updates":
        return list.filter(m => subj(m.subject).includes("lesson update") || subj(m.subject).includes("lesson"));
      case "progress-updates":
        return list.filter(m => subj(m.subject).includes("progress note") || subj(m.subject).includes("progress"));
      case "request-responses":
        return list.filter(m => subj(m.subject).includes("request response") || subj(m.subject).includes("request"));
      case "warnings":
        return list.filter(m => subj(m.subject).includes("warning") || subj(m.subject).includes("blocked"));
      case "lesson-requests":
        return list.filter(m => subj(m.subject).includes("lesson request"));
      case "student-requests":
        return list.filter(m => subj(m.subject).includes("student request") || subj(m.subject).includes("request"));
      case "reports":
        return list.filter(m => subj(m.subject).includes("report"));
      default:
        return list;
    }

    if (tabKey === "other"){ 
      return list.filter(m => {
        const s = subj(m.subject);
        return !(s.includes("private message") || s.includes("lesson update") || s.includes("lesson") ||
                 s.includes("progress note") || s.includes("progress") ||
                 s.includes("request response") || s.includes("request") ||
                 s.includes("warning") || s.includes("blocked"));
      });
    }
  };

  const tabs = buildTabs();
  const visibleMessages = filterByTab(activeTab);

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
                className="rounded-md px-3 py-2 font-semibold"
                onClick={() => {
                  setMobileOpen(false);           // exclusive with mobile drawer
                  setShowMenu((p) => !p);
                }}
                aria-haspopup="menu"
                aria-expanded={showMenu}
                title="Profile menu"
              >
                <List size={24} weight="bold" />
              </button>

              {/* Desktop overlay to match mobile drawer behavior */}
              {showMenu && (
                <div
                  className="hidden md:block fixed inset-0 z-[55]"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
              )}

              {/* Dropdown */}
              {showMenu && (
                <div
                  ref={dropdownRef}                              // ADD
                  className="absolute right-4 top-16 w-56 bg-white text-gray-800 rounded-md shadow-lg py-2 z-[60]" // z above overlay
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
                className="login-button text-white border px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-2 sm:mt-0"
                onClick={() => handleNav("/login")}
              >
                Login
              </button>
              <button
                className="signup-button text-white border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-2 sm:mt-0"
                onClick={() => handleNav("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="rounded-md p-2"
            onClick={() => {
              setShowMenu(false);           // exclusive with profile menu
              setMobileOpen(true);
            }}
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
                  <div className="flex flex-row items-center gap-3 px-3 py-2 border-b mb-2">
                    {user?.image ? (
                      <img src={user.image} alt={user?.name || "User"} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#2B5561] text-white flex items-center justify-center font-semibold">
                        {(user?.name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.name || "User"}</span>
                      <span className="text-sm text-gray-600">{user?.email || ""}</span>
                    </div>
                  </div>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/")}> <House size={22} /> Home</button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/dashboard")}> <Grid size={22} /> Dashboard</button>
                  {/* Role-specific */}
                  <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">Shortcuts</div>
                  {/* Reuse links */}
                  <div className="flex flex-col">
                    {role === "Tutor" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/lessonrequests")}><ClockCountdown size={22} /> Lesson Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/studentfiles")}><UsersThree size={22} /> Student Files</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/lessonfeedback")}><ChatText size={22} /> Lesson Feedback</button>
                      </>
                    )}
                    {role === "Admin" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/addstaff")}><UserCirclePlusIcon size={22} /> Add Staff</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/manageusers")}><UserList size={22} /> Manage Users</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/studentrequests")}><ListChecks size={22} /> Student Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/userexperiencefeedback")}><ClipboardText size={22} /> User Experience Feedback</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/managereports")}><Megaphone size={22} /> Manage Reports</button>
                      </>
                    )}
                    {role === "Student" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/booking")}><Calendar size={22} /> Book Lessons</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => handleNav("/requestform")}><QuestionMark size={22} /> Request Form</button>
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
                  <button className="w-full px-4 py-2 rounded-[4px] bg-[#2B5561] text-white font-semibold hover:bg-[#2B5561]/70" onClick={() => handleNav("/login")}>
                    Login
                  </button>
                  <button className="w-full px-4 py-2 rounded-md border border-yellow-500 text-black font-semibold hover:bg-yellow-500 hover:text-white" onClick={() => handleNav("/signup")}>
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
          type="button"
          onClick={() => setInboxOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-[#2B5561] rounded-full shadow-lg flex items-center justify-center w-14 h-14 md:w-16 md:h-16 hover:bg-[#2B5561]/70 transition"
          title="Inbox"
          aria-label="Open inbox"
        >
          <span className="md:hidden">
            <EnvelopeSimple size={28} color="#fff" weight="bold" />
          </span>
          <span className="hidden md:inline">
            <EnvelopeSimple size={32} color="#fff" weight="bold" />
          </span>
        </button>
      )}

      {/* Inbox Modal (responsive) */}
      {inboxOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-stretch md:items-center z-[100] p-0 md:p-4">
          <div className="bg-white w-full h-full md:h-[80vh] md:max-w-5xl md:rounded-2xl shadow-lg p-0 relative flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-[#2B5561]">
                Inbox <span className="text-gray-500">({messages.length})</span>
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                onClick={() => setInboxOpen(false)}
                title="Close"
                aria-label="Close inbox"
              >
                &times;
              </button>
            </div>

            {/* Role-based tabs */}
            <div className="flex gap-2 px-4 sm:px-6 py-2 border-b bg-gray-50 overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${activeTab === t.key ? "bg-cyan-100 text-[#2B5561]" : "text-gray-500"}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-2 py-2">
              {visibleMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">No messages</div>
              ) : (
                visibleMessages.map((msg) => (
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
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;