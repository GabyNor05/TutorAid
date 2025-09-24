import './App.css';
/* import 'bootstrap/dist/css/bootstrap.min.css'; */
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
import LessonFeedback from './pages/tutor/lessonFeedback/LessonFeedback';
import ReportForm from './pages/tutor/reportForm/ReportForm';
import StudentFileView from './pages/tutor/studentFileView/StudentFileView';
import AddStaff from './pages/admin/addStaff/AddStaff';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/onboarding";
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />   
        <Route path="/onboarding" element={<Onboarding />} /> 
        <Route path="/otp" element={<Otp />} /> 
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/lessonrequests" element={<LessonRequests />} />
        <Route path="/studentfiles" element={<StudentFiles />} />
        <Route path="/lessonFeedback" element={<LessonFeedback />} />
        <Route path="/reportform" element={<ReportForm />} />
        <Route path="/studentfileview" element={<StudentFileView />} />
        <Route path="/addstaff" element={<AddStaff />} />
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