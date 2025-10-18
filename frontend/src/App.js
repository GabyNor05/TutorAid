import './App.css';
import React, { useState, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Signup from './pages/signup/Signup';
import Login from './pages/login/login';
import Navbar from './pages/generalComponents/Navbar';
import Onboarding from './pages/onboarding/onboarding';
import Otp from './pages/otp/Otp';
import UserProfile from './pages/generalComponents/userProfile/UserProfile';
import LessonRequests from './pages/tutor/lessonRequests/LessonRequests';
import StudentFiles from './pages/tutor/studentFiles/StudentFiles';
import LessonFeedback from './pages/tutor/lessonFeedback/LessonFeedback';
import ReportForm from './pages/tutor/reportForm/ReportForm';
import StudentFileView from './pages/tutor/studentFileView/StudentFileView';
import AddStaff from './pages/admin/addStaff/addStaff';
import Booking from './pages/student/booking/Booking';
import ManageUsers from './pages/admin/manageUsers/ManageUsers';
import UserFileView from './pages/admin/manageUsers/UserFileView';
import RequestForm from './pages/student/requestForm/RequestForm';
import StudentRequests from './pages/admin/studentRequests/StudentRequests';
import ManageReports from './pages/admin/manageReports/ManageReports';
import Home from './pages/home/Home';
import { EnvelopeSimple } from "@phosphor-icons/react"; // or any inbox/mail icon
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
      debug_mode: true
    });
  }, [location]);

  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/onboarding";
  const userId = localStorage.getItem("userID");
  const [inboxOpen, setInboxOpen] = React.useState(false);

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />   
        <Route path="/onboarding" element={<Onboarding />} /> 
        <Route path="/otp" element={<Otp />} /> 
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/lessonrequests" element={<LessonRequests />} />
        <Route path="/studentfiles" element={<StudentFiles />} />
        <Route path="/lessonFeedback" element={<LessonFeedback />} />
        <Route path="/reportform" element={<ReportForm />} />
        <Route path="/tutor/studentFileView/:userID" element={<StudentFileView />} />
        <Route path="/addstaff" element={<AddStaff />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/manageusers" element={<ManageUsers />} />
        <Route path="/admin/manageUsers/edit/:userID" element={<UserFileView />} />
        <Route path="/requestform" element={<RequestForm />} />
        <Route path="/studentrequests" element={<StudentRequests />} />
        <Route path="/managereports" element={<ManageReports />} />
        <Route path="/" element={<Home />} />
      </Routes>

      {userId && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer w-16 h-16 hover:bg-cyan-700 transition" title="Inbox">
          <EnvelopeSimple size={32} color="#fff" weight="bold" />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;