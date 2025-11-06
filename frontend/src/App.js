import './App.css';
import React from "react";
import { Routes, Route, useLocation } from 'react-router-dom';
import { analytics } from './lib/analytics';

//Pages
import Dashboard from './pages/dashboard/Dashboard';
import Signup from './pages/signup/Signup';
import Login from './pages/login/login';
import Navbar from './pages/generalComponents/Navbar';
import Onboarding from './pages/onboarding/onboarding';
import Onboarding2 from './pages/onboarding/Onboarding2';
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
import Newsletter from './pages/admin/newsletter/Newsletter';
import Unsubscribe from './pages/admin/newsletter/Unsubscribe';
import ForgotPassword from './pages/forgotpassword/ForgotPassword';
import UserFeedback from './pages/admin/userFeedback/UserFeedback';


function usePageTracking() {
  const location = useLocation();
  React.useEffect(() => {
    analytics.pageView(location.pathname + location.search, document.title);
  }, [location]);
}

export default function App() {
  usePageTracking();

  const location = useLocation();
  const hideNavbar = ['/login', '/signup', '/onboarding', '/otp'].includes(location.pathname);

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
        <Route path="/onboarding2" element={<Onboarding2 />} />
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
        <Route path="/newsletter" element={<Newsletter />}/>
        <Route path="/unsubscribe" element={<Unsubscribe />}/>
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/userFeedback" element={<UserFeedback />} />
      </Routes>

    </div>
  );
}