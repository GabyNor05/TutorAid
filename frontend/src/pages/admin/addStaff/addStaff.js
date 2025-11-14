import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./css/addStaff.css";
import { api, endpoints } from "../../../api/client";
import { CaretLeftIcon } from "@phosphor-icons/react";


function AddStaff() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Admin",
        image: null,
        bio: "",
        qualifications: "",
        fee_per_hour: "",
        experience: "",
        experience_unit: "years", // ADD default
    });

    // Availability state
    const [availability, setAvailability] = useState({
        monFri: { enabled: false, start: "", end: "" },
        satSun: { enabled: false, start: "", end: "" }
    });

    const [subjects, setSubjects] = useState(["", "", ""]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const data = await api.get(endpoints.subjects()); // USE client.js
                setSubjectOptions((Array.isArray(data) ? data : []).map(s => s.name));
            } catch (err) {
                console.error("Error fetching subjects:", err);
            }
        }
        fetchSubjects();
    }, []);

    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setForm({ ...form, image: files?.[0] || null });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleAvailabilityChange = (period, field, value) => {
        setAvailability(prev => ({
            ...prev,
            [period]: { ...prev[period], [field]: value }
        }));
    };

    const handleAvailabilityToggle = period => {
        setAvailability(prev => ({
            ...prev,
            [period]: { ...prev[period], enabled: !prev[period].enabled }
        }));
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const buildAvailabilityString = () => {
        let str = "";
        if (availability.monFri.enabled && availability.monFri.start && availability.monFri.end) {
            str += `Mon-Fri: ${availability.monFri.start}-${availability.monFri.end}; `;
        }
        if (availability.satSun.enabled && availability.satSun.start && availability.satSun.end) {
            str += `Sat-Sun: ${availability.satSun.start}-${availability.satSun.end}`;
        }
        return str.trim();
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // 1) Create user (with image) via multipart
        try {
            const userFd = new FormData();
            if (form.image) userFd.append("image", form.image);
            userFd.append("name", form.name);
            userFd.append("email", form.email);
            userFd.append("password", form.password);
            userFd.append("role", form.role); // createUser saves role on users table

            const created = await api.post(endpoints.users(), userFd); // returns { userID }
            const userID = created?.userID;
            if (!userID) throw new Error("User not created");

            // 2) If Tutor, upsert tutor profile with extra fields
            if (form.role === "Tutor") {
                const availabilityStr = buildAvailabilityString();
                const subjectsStr = subjects.filter(Boolean).join(", ");
                const experienceText = form.experience
                    ? `${form.experience} ${form.experience_unit || "years"}`
                    : "";

                await api.put(endpoints.tutorByUser(userID), {
                    bio: form.bio || "",
                    subjects: subjectsStr,
                    qualifications: form.qualifications || "",
                    availability: availabilityStr,
                    fee_per_hour: form.fee_per_hour ? Number(form.fee_per_hour) : 0,
                    experience: experienceText,
                });
            }

            alert("Staff member added!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error adding staff:", error);
            alert("Error adding staff: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div className="page-background">
            <button
                    type="button"
                    style={{ position: 'fixed', left: 16, top: 80, zIndex: 2147483647 }}
                    className="px-3 py-1.5 bg-[#2B5561] text-white text-lg hover:border-[#2B5561]/70 border-2 rounded-lg flex flex-row items-center gap-2"
                    onClick={() => {
                      if (localStorage.getItem('selectedTutorID')) localStorage.removeItem('selectedTutorID');
                      navigate(-1);
                    }}
                  >
                    {/* ← */}  <CaretLeftIcon size={24} /> Back
                  </button>
            <div className="addstaff-form-container">
                <div className="pt-2 text-center">
                    <h2>Add Staff Member</h2>
                </div>
                <form className="addstaff-form" onSubmit={handleSubmit}>
                    <div className="addStaff-form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="addStaff-form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="addStaff-form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="addStaff-form-group">
                        <label>Role</label>
                        <select name="role" value={form.role} onChange={handleChange} required>
                            <option value="Admin">Admin</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                    </div>

                    {form.role === "Tutor" && (
                        <>
                            <div className="addStaff-form-group">
                                <label>Bio</label>
                                <textarea name="bio" value={form.bio} onChange={handleChange} />
                            </div>

                            <div className="addStaff-form-group">
                                <label>Subjects</label>
                                <div className="subjects-selects">
                                    {[0, 1, 2].map(i => (
                                        <select
                                            key={i}
                                            value={subjects[i]}
                                            onChange={e => handleSubjectChange(i, e.target.value)}
                                            required={i === 0}
                                            className="subject-select"
                                        >
                                            <option value="">Select Subject {i + 1}</option>
                                            {subjectOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ))}
                                </div>
                            </div>

                            <div className="addStaff-form-group">
                                <label>Qualifications</label>
                                <textarea name="qualifications" value={form.qualifications} onChange={handleChange} />
                            </div>

                            <div className="addStaff-form-group">
                                <label>Availability</label>
                                <div className="availability-block">
                                    <div className="availability-block-row">
                                        <label>Mon-Fri</label>
                                        <input
                                            type="checkbox"
                                            checked={availability.monFri.enabled}
                                            onChange={() => handleAvailabilityToggle("monFri")}
                                        />
                                    </div>
                                    {availability.monFri.enabled && (
                                        <div className="availability-times">
                                            <label>
                                                Start:
                                                <input
                                                    type="time"
                                                    value={availability.monFri.start}
                                                    onChange={e => handleAvailabilityChange("monFri", "start", e.target.value)}
                                                    required
                                                />
                                            </label>
                                            <label>
                                                End:
                                                <input
                                                    type="time"
                                                    value={availability.monFri.end}
                                                    onChange={e => handleAvailabilityChange("monFri", "end", e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="availability-block">
                                    <div className="availability-block-row">
                                        <label>Sat-Sun</label>
                                        <input
                                            type="checkbox"
                                            checked={availability.satSun.enabled}
                                            onChange={() => handleAvailabilityToggle("satSun")}
                                        />
                                    </div>
                                    {availability.satSun.enabled && (
                                        <div className="availability-times">
                                            <label>
                                                Start:
                                                <input
                                                    type="time"
                                                    value={availability.satSun.start}
                                                    onChange={e => handleAvailabilityChange("satSun", "start", e.target.value)}
                                                    required
                                                />
                                            </label>
                                            <label>
                                                End:
                                                <input
                                                    type="time"
                                                    value={availability.satSun.end}
                                                    onChange={e => handleAvailabilityChange("satSun", "end", e.target.value)}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="addStaff-form-group">
                                <label>Fee per hour (Rand)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="fee_per_hour"
                                    placeholder="Fee per hour (Rand)"
                                    value={form.fee_per_hour}
                                    onChange={handleChange}
                                    className="border rounded p-2 w-full"
                                    required
                                />
                            </div>

                            <div className="addStaff-form-group">
                                <label>Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="experience"
                                    placeholder="Amount"
                                    value={form.experience}
                                    onChange={handleChange}
                                    className="border rounded p-2 w-full"
                                    required
                                />
                                <select
                                    name="experience_unit"
                                    value={form.experience_unit}
                                    onChange={handleChange}
                                    className="border rounded p-2 w-full mt-2"
                                    required
                                >
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="addStaff-form-group">
                        <label>Profile Image</label>
                        <input type="file" name="image" accept="image/*" onChange={handleChange} required />
                    </div>

                    <div className="addStaff-form-group">
                        <button type="submit">Add Staff</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStaff;
