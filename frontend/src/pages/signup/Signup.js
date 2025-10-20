import React, { useState } from "react";
import "./css/signup.css";
import signupImage from "./assets/loginImage.png";
import { useNavigate } from "react-router-dom";
import WhiteWallpaper from '../reusableAssets/whitepaper.png';
import logo from '../reusableAssets/logo.png';
import { useSEO } from '../../lib/seo';
import { api, endpoints } from '../../api/client';

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useSEO({
    title: 'Tutor Aid — Sign Up',
    description: 'University Project: Create your Tutor Aid account to find tutors and book lessons.',
    canonical: 'https://gabydv.xyz/signup',
  });

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
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
      // Create user WITHOUT assigning role yet
      const res = await api.post(endpoints.users(), {
        name: username,
        email,
        password,
        role: "" // leave empty; backend createUser will only add role-specific rows when role is set
      });
      const userID = res.userID || res?.user?.userID || res?.id; // handle shapes
      if (!userID) throw new Error("Signup failed (no userID).");

      localStorage.setItem("userID", userID);
      setCreatedUserId(userID);
      setShowRoleModal(true); // prompt for role
    } catch (error) {
      setErrors({ api: error.message || "Signup failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const assignRole = async (role) => {
    if (!createdUserId) return;
    try {
      await api.put(endpoints.assignRole(createdUserId), { role });
      // Navigate based on selection
      if (role === 'Student') navigate('/onboarding');
      else navigate('/onboarding');
    } catch (e) {
      setPopupMessage("Failed to assign role. Please try again.");
    }
  };

  return (
    <div className="page-background min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl h-[75dvh] bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch min-h-0">
        {/* Image */}
        <div className="hidden md:block bg-[#2B5561]/5 h-full min-h-0">
          <img src={signupImage} alt="signup" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="h-full min-h-0 p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-4 text-center md:text-center">
            Create your account
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.username && <span className="text-red-600 text-xs">{errors.username}</span>}
            </div>

            <div>
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

            <div>
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
              className="signup-btn w-3/4 h-12 rounded-[4px] bg-[#2B5561] hover:bg-[#2B5561]/70 text-white font-semibold transition"
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

      {/* Role selection modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#2B5561] mb-2">Choose your role</h3>
            <p className="text-sm text-gray-600 mb-6">Tell us how you want to use Tutor Aid.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className="h-11 rounded-md bg-[#2B5561] hover:bg-[#2B5561]/80 text-white font-semibold"
                onClick={() => assignRole('Student')}
              >
                I’m a Student
              </button>
              <button
                className="h-11 rounded-md bg-white border border-[#2B5561] text-[#2B5561] hover:bg-[#2B5561]/10 font-semibold"
                onClick={() => assignRole('Tutor')}
              >
                I’m a Tutor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;