import React, { useState, useEffect } from "react";
import "./css/onboarding.css";
import onboardingImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import logo from '../reusableAssets/logo.png';
import { api, endpoints } from '../../api/client';

function Onboarding() {
  const navigate = useNavigate();

  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Student fields only
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    const id = localStorage.getItem("userID");
    if (!id) { navigate('/login'); return; }
    setUserID(id);

    (async () => {
      try {
        // Prefill if student row exists
        const s = await api.get(endpoints.studentByUser(id)).catch(() => null);
        if (s) {
          setSchool(s.school || '');
          setGrade(s.grade || '');
          setAddress(s.address || '');
          setCity(s.city || '');
          setProvince(s.province || '');
          setStatus(s.status || 'Active');
        }
      } catch {
        // ignore
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

  const submitStudent = async () => {
    const v = validateStudent();
    setErrors(v);
    if (Object.keys(v).length) return;
    if (!userID) return;
    setLoading(true);
    try {
      await api.put(endpoints.studentByUser(userID), { school, grade, address, city, province, status });
      // Ensure role is Student
      if (endpoints.assignRole) {
        await api.put(endpoints.assignRole(userID), { role: 'Student' }).catch(() => {});
      }
      navigate('/onboarding2');
    } catch (err) {
      setErrors({ api: err.message || 'Onboarding failed. Please try again.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page-background min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl h-[75dvh] bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch min-h-0">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5 h-full min-h-0">
          <img src={onboardingImage} alt="onboarding" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="h-full min-h-0 p-6 sm:p-8 overflow-y-auto flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-6 text-center md:text-center">
            Tell us about yourself
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 w-full">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
              <input
                type="text" id="school" name="school" value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.school && <span className="text-red-600 text-xs">{errors.school}</span>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <input
                type="text" id="grade" name="grade" value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.grade && <span className="text-red-600 text-xs">{errors.grade}</span>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text" id="address" name="address" value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
              {errors.address && <span className="text-red-600 text-xs">{errors.address}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text" id="city" name="city" value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  id="province" name="province" value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
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
        </div>
      </div>
    </div>
  );
}

export default Onboarding;