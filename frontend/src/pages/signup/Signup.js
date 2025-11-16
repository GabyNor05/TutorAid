import React, { useState } from "react";
import "./css/signup.css";
import signupImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import WhiteWallpaper from '../reusableAssets/whitepaper.png';
import logo from '../reusableAssets/logo.png';
import { useSEO } from '../../lib/seo';
import { api, endpoints } from '../../api/client';
import { analytics } from '../../lib/analytics';
import { X, House } from "@phosphor-icons/react";

function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [createdUserId, setCreatedUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useSEO({
    title: 'Tutor Aid — Sign Up',
    description: 'University Project: Create your Tutor Aid account to find tutors and book lessons.',
    canonical: 'https://gabydv.xyz/signup',
  });

  const validate = () => {
    const newErrors = {};
    if (!firstName || !lastName) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    }
    if (!password) newErrors.password = "Password is required";
    else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
      }
    }
    return newErrors;
  };

  const handleSignUpClick = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || submitting) return;

    try {
      setSubmitting(true);
      const res = await api.post(endpoints.users(), {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: "Student"
      });
      const userID = res.userID || res?.user?.userID || res?.id;
      if (!userID) throw new Error("Signup failed (no userID).");

      localStorage.setItem("userID", userID);
      setCreatedUserId(userID);

      // Send welcome message: Admin -> new user
      try {
        let adminID = null;
        // Prefer admin group user if available
        try {
          const group = await api.get(endpoints.adminGroupUser());
          if (group?.userID) adminID = Number(group.userID);
        } catch {}
        // Fallback to first Admin user
        if (!adminID) {
          const admins = await api.get(endpoints.usersByRole("Admin"));
          const first = (Array.isArray(admins) ? admins : []).find(a => a?.userID);
          if (first?.userID) adminID = Number(first.userID);
        }
        if (adminID) {
          await api.post(endpoints.messages(), {
            type: "Welcome Message",
            subject: "Welcome to Tutor Aid",
            body: `Hi ${firstName || "there"}, welcome to Tutor Aid! We're glad you're here. Feel free to explore and start booking lessons with our tutors. If you have any questions, don't hesitate to reach out. Happy learning!
            Best regards,
            Tutor Aid Team`,
            senderID: adminID,           // Admin sends
            receiverID: Number(userID),  // New user receives
          });
        }
      } catch {
        // Do not block signup if welcome message fails
      }

      navigate('/onboarding');
      analytics.event('sign_up', { method: 'password' });
    } catch (error) {
      setErrors({ general: "Signup failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="page-background min-h-dvh flex items-center justify-center px-4 py-8">
      <button
              type="button"
              style={{ position: 'fixed', left: 16, top: 80, zIndex: 2147483647 }}
              className="px-3 py-1.5 bg-[#2B5561] text-white text-lg hover:border-[#2B5561]/70 border-2 rounded-lg flex flex-row items-center gap-2"
              onClick={() => {
                navigate('/');
              }}
            >
               <House size={24} /> Home
      </button>
      <div className="w-full max-w-5xl h-[75dvh] bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch min-h-0">
        {/* Image */}
        <div className="hidden md:block bg-[#2B5561]/5 h-full min-h-0">
          <img src={signupImage} alt="signup" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="h-full min-h-0 p-6 sm:p-8 overflow-y-auto flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-4 text-center md:text-center">
            Create your account
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6 flex flex-col items-center">
            <div className="w-full flex flex-row gap-4">
              <div className="w-1/2 flex flex-col items-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              </div>
              <div className="w-1/2 flex flex-col items-start">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              </div>
              
              {errors.name && <span className="text-red-600 text-xs">{errors.name}</span>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.password && <span className="text-red-600 text-xs">{errors.password}</span>}
            </div>

            {errors.api && <div className="text-red-600 text-xs">{errors.api}</div>}

            <button
              className="signup-btn mr-auto w-3/4 h-12 rounded-[4px] bg-[#2B5561] hover:bg-[#2B5561]/70 text-white font-semibold transition"
              type="button"
              onClick={handleSignUpClick}
              disabled={submitting}
            >
              {submitting ? 'Signing up…' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </div>

        </div>
      </div>

      
    </div>
  );
}

export default Signup;