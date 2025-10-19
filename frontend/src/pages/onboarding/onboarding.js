import React, { useState, useEffect } from "react";
import "./css/onboarding.css";
import onboardingImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import { useSEO } from '../../lib/seo';
import logo from '../reusableAssets/logo.png';
import { api, endpoints } from '../../api/client';

function Onboarding() {
  const navigate = useNavigate();

  // role + user
  const [role, setRole] = useState(""); // "Student" | "Tutor" | ""
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Student fields
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("Active");

  // Tutor fields
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState("");        // comma-separated
  const [qualifications, setQualifications] = useState("");
  const [availability, setAvailability] = useState("");

  useSEO({
    title: 'Tutor Aid — Onboarding',
    description: 'University Project: Tell us about yourself to personalize your Tutor Aid experience.',
    canonical: 'https://gabydv.xyz/onboarding',
  });

  useEffect(() => {
    const id = localStorage.getItem("userID");
    if (!id) { navigate('/login'); return; }
    setUserID(id);

    (async () => {
      try {
        // get user and role
        const u = await api.get(endpoints.userById(id));
        if (u?.role) setRole(u.role);

        if (u?.role === 'Student') {
          const s = await api.get(endpoints.studentByUser(id)).catch(() => null);
          if (s) {
            setSchool(s.school || '');
            setGrade(s.grade || '');
            setAddress(s.address || '');
            setCity(s.city || '');
            setProvince(s.province || '');
            setStatus(s.status || 'Active');
          }
        } else if (u?.role === 'Tutor') {
          const t = await api.get(endpoints.tutorByUser(id)).catch(() => null);
          if (t) {
            setBio(t.bio || '');
            setSubjects(t.subjects || '');
            setQualifications(t.qualifications || '');
            setAvailability(t.availability || '');
          }
        }
      } catch {
        // ignore; allow manual selection below
      }
    })();
  }, [navigate]);

  const validateStudent = () => {
    const e = {};
    if (!school) e.school = "School is required";
    if (!grade) e.grade = "Grade is required";
    if (!address) e.address = "Address is required";
    if (!city) e.city = "City is required";
    if (!province) e.province = "Province is required";
    return e;
  };

  const validateTutor = () => {
    const e = {};
    if (!bio) e.bio = "Bio is required";
    if (!subjects) e.subjects = "Subjects are required";
    if (!qualifications) e.qualifications = "Qualifications are required";
    return e;
  };

  const submitStudent = async () => {
    const v = validateStudent();
    setErrors(v);
    if (Object.keys(v).length) return;
    if (!userID) return;
    setLoading(true);
    try {
      await api.put(endpoints.studentByUser(userID), { school, grade, address, city, province, status });
      await api.put(endpoints.assignRole(userID), { role: 'Student' });
      navigate('/onboarding2');
    } catch (err) {
      setErrors({ api: err.message || 'Onboarding failed. Please try again.' });
    } finally { setLoading(false); }
  };

  const submitTutor = async () => {
    const v = validateTutor();
    setErrors(v);
    if (Object.keys(v).length) return;
    if (!userID) return;
    setLoading(true);
    try {
      await api.put(endpoints.tutorByUser(userID), { bio, subjects, qualifications, availability });
      await api.put(endpoints.assignRole(userID), { role: 'Tutor' });
      navigate('/onboarding2'); 
    } catch (err) {
      setErrors({ api: err.message || 'Onboarding failed. Please try again.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page-background min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5">
          <img src={onboardingImage} alt="onboarding" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-6 text-center md:text-center">
            {role === 'Student' ? 'Tell us about yourself' : 'Tell us about your tutoring'}
          </h2>

          {role === 'Student' ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 w-full">
              <div className="flex flex-row item-start gap-2">
                <label>School</label>
                <input
                  type="text" id="school" name="school" value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.school && <span className="text-red-600 text-xs">{errors.school}</span>}

              <div className="flex flex-row item-start gap-2">
                <label>Grade</label>
                <input
                  type="text" id="grade" name="grade" value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.grade && <span className="text-red-600 text-xs">{errors.grade}</span>}

              <div className="flex flex-row item-start gap-2">
                <label>Address</label>
                <input
                  type="text" id="address" name="address" value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.address && <span className="text-red-600 text-xs">{errors.address}</span>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-row item-start gap-2">
                  <label>City</label>
                  <input
                    type="text" id="city" name="city" value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                  />
                </div>
                <div className="flex flex-row item-start gap-2">
                  <label>Province</label>
                  <select
                    id="province" name="province" value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                  >
                    <option value="">Select Province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </div>
              </div>

              {errors.api && <div className="text-red-600 text-xs">{errors.api}</div>}

              <button
                className="w-full h-11 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition disabled:opacity-60"
                type="button" disabled={loading} onClick={submitStudent}
              >
                {loading ? 'Saving…' : 'Next'}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 w-full">
              <div className="flex flex-row item-start gap-2">
                <label>Bio</label>
                <textarea
                  id="bio" name="bio" rows={3} value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-transparent p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.bio && <span className="text-red-600 text-xs">{errors.bio}</span>}

              <div className="flex flex-row item-start gap-2">
                <label>Subjects</label>
                <input
                  type="text" id="subjects" name="subjects" placeholder="e.g., Maths, Science, English"
                  value={subjects} onChange={(e) => setSubjects(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.subjects && <span className="text-red-600 text-xs">{errors.subjects}</span>}

              <div className="flex flex-row item-start gap-2">
                <label>Qualifications</label>
                <input
                  type="text" id="qualifications" name="qualifications" value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              {errors.qualifications && <span className="text-red-600 text-xs">{errors.qualifications}</span>}

              <div className="flex flex-row item-start gap-2">
                <label>Availability</label>
                <input
                  type="text" id="availability" name="availability" placeholder="e.g., Mon–Fri: 14:00–18:00"
                  value={availability} onChange={(e) => setAvailability(e.target.value)}
                  className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>

              {errors.api && <div className="text-red-600 text-xs">{errors.api}</div>}

              <button
                className="w-full h-11 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition disabled:opacity-60"
                type="button" disabled={loading} onClick={submitTutor}
              >
                {loading ? 'Saving…' : 'Next'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;