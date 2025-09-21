import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Signup from './pages/signup/Signup';
import Login from './pages/login/login';
import Navbar from './pages/generalComponents/Navbar';
import Onboarding from './pages/onboarding/onboarding';
import Otp from './pages/otp/Otp';
import UserProfile from './pages/generalComponents/userProfile/UserProfile';
import LessonRequests from './pages/tutor/lessonRequests/LessonRequests';
import StudentFiles from './pages/tutor/studentFiles/StudentFiles';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/onboarding";
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />   
        <Route path="/onboarding" element={<Onboarding />} /> 
        <Route path="/otp" element={<Otp />} /> 
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/lessonrequests" element={<LessonRequests />} />
        <Route path="/studentfiles" element={<StudentFiles />} />
      </Routes>
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