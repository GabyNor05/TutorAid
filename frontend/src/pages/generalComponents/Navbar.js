import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  List as ListIcon,
  EnvelopeSimple,
  X,
  House,
  SquaresFour,
  UserPlus,
  ClipboardText,
  Calendar,
  UsersThree,
  ClockCountdown,
  QuestionMark,
  ListChecks,
  ChatText,
  Megaphone,
  UserList,
  Newspaper,
  SignOut
} from "@phosphor-icons/react";
import Logo from "../reusableAssets/logo.png";
import Inbox from "./Inbox";
import { api, endpoints } from "../../api/client";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [inboxOpen, setInboxOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleNav = (path) => {
    setShowMenu(false); // keep calls valid
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

    if (tabKey === "other") {
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
              {/* Open the same side panel on desktop */}
              <button
                className="rounded-md px-3 py-2 font-semibold"
                onClick={() => {
                  setShowMenu(false);   // keep in sync (not used anymore)
                  setMobileOpen(true);  // open drawer on desktop
                }}
                aria-haspopup="dialog"
                aria-expanded={mobileOpen}
                title="Open menu"
              >
                <ListIcon size={24} weight="bold" />
              </button>
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
              setShowMenu(false);
              setMobileOpen(true);
            }}
            aria-label="Open menu"
          >
            <ListIcon size={24} weight="bold" />
          </button>
        </div>
      </nav>

      {/* Mobile/Desktop side panel (now for all screen sizes) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-80 md:w-[420px] max-w-[85%] bg-white text-gray-800 shadow-xl flex flex-col">
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
                      <span className="text-sm text-gray-500 underline" onClick={() => handleNav("/userprofile")}>View Profile</span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/")}> <House size={22} /> Home</button>
                    </div>
                    <div>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/dashboard")}> <SquaresFour size={22} /> Dashboard</button>
                    </div>
                  </div>

                  {/* Role-specific */}
                  <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">Shortcuts</div>
                  {/* Reuse links */}
                  <div className="flex flex-col">
                    {role === "Tutor" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/lessonrequests")}><ClockCountdown size={22} /> Lesson Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/studentfiles")}><UsersThree size={22} /> Student Files</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/lessonfeedback")}><ChatText size={22} /> Lesson Feedback</button>
                      </>
                    )}
                    {role === "Admin" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/addstaff")}><UserPlus size={22} /> Add Staff</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/manageusers")}><UserList size={22} /> Manage Users</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/studentrequests")}><ListChecks size={22} /> Student Requests</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/newsletter")}><Newspaper size={22} /> Newsletter</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/userfeedback")}><ClipboardText size={22} /> User Feedback</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/managereports")}><Megaphone size={22} /> Manage Reports</button>
                      </>
                    )}
                    {role === "Student" && (
                      <>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/booking")}><Calendar size={22} /> Book Lessons</button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex flex-row gap-2" onClick={() => handleNav("/requestform")}><QuestionMark size={22} /> Request Form</button>
                      </>
                    )}
                  </div>
                  <button className="mt-4 w-full text-left px-3 py-2 rounded hover:bg-red-50 text-teal-900 flex flex-row gap-2" onClick={() => handleNav("/userfeedback")}>
                    <ClipboardText size={22} /> User Feedback
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 flex flex-row gap-2"
                    onClick={() => {
                      localStorage.removeItem("userID");
                      handleNav("/login");
                    }}
                  >
                    <SignOut size={22} /> Log out
                  </button>
                </>
              ) : (
                <div className="p-3 flex flex-col gap-2">
                  <button className="w-full px-4 py-2 rounded-[4px] bg-[#2B5561] text-white font-semibold hover:bg-[#2B5561]/70" onClick={() => handleNav("/login")}>
                    Login
                  </button>
                  <button className="w-full px-4 py-2 rounded-md border border-[#2B5561] text-[#2B5561] font-semibold hover:bg-[#2B5561]/50 hover:text-white" onClick={() => handleNav("/signup")}>
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

      {/* Inbox moved to component */}
      <Inbox
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        messages={messages}
        visibleMessages={visibleMessages}
      />
    </header>
  );
}

export default Navbar;