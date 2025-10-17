import React, { useState } from "react";
import "./css/onboarding.css";
import onboardingImage from "./assets/calendarImage.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Onboarding() {
  const navigate = useNavigate();
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;

  const handleOnboardingClick = async () => {
    const newErrors = {};
    if (!school) newErrors.school = "School is required";
    if (!grade) newErrors.grade = "Grade is required";
    if (!address) newErrors.address = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!province) newErrors.province = "Province is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const userID = localStorage.getItem("userID");
        await axios.put(`${API_URL}/api/users/${userID}`, {
          role: "Student",
          grade,
          school,
          address,
          city,
          province,
          status,
        });
        navigate("/dashboard");
      } catch {
        setErrors({ api: "Onboarding failed. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5">
          <img
            src={onboardingImage}
            alt="onboarding"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-6 text-center md:text-left">
            Tell us about yourself
          </h2>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.school && (
                <span className="text-red-600 text-xs">{errors.school}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.grade && (
                <span className="text-red-600 text-xs">{errors.grade}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.address && (
                <span className="text-red-600 text-xs">{errors.address}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.city && (
                  <span className="text-red-600 text-xs">{errors.city}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  id="province"
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                {errors.province && (
                  <span className="text-red-600 text-xs">{errors.province}</span>
                )}
              </div>
            </div>

            {errors.api && (
              <div className="text-red-600 text-xs">{errors.api}</div>
            )}

            <button
              className="w-full h-11 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition"
              type="button"
              onClick={handleOnboardingClick}
            >
              Go to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;