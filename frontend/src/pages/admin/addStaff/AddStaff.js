import React, { useState } from "react";
import "./css/addStaff.css";

const subjectOptions = [
    "Math", "Afrikaans", "Physics", "Biology", "English", "Zulu", "Sepedi",
    "Math Literacy", "AP Math", "AP English", "AP Biology", "IT", "CAT",
    "History", "Geography", "EMS", "Business Studies", "Accounting", "Homework"
];

function AddStaff() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Admin",
        profileImage: null,
        bio: "",
        subjects: "",
        qualifications: "",
        availability: ""
    });

    // Availability state
    const [availability, setAvailability] = useState({
        monFri: { enabled: false, start: "", end: "" },
        satSun: { enabled: false, start: "", end: "" }
    });

    const [subjects, setSubjects] = useState(["", "", ""]);


    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === "profileImage") {
            setForm({ ...form, profileImage: files[0] });
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

    const handleSubmit = e => {
        e.preventDefault();
        // Build availability string for backend
        let availabilityStr = "";
        if (availability.monFri.enabled && availability.monFri.start && availability.monFri.end) {
            availabilityStr += `Mon-Fri: ${availability.monFri.start}-${availability.monFri.end}; `;
        }
        if (availability.satSun.enabled && availability.satSun.start && availability.satSun.end) {
            availabilityStr += `Sat-Sun: ${availability.satSun.start}-${availability.satSun.end}`;
        }

        // Prepare form data
         const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        data.append("subjects", subjects.filter(s => s).join(", ")); // comma-separated
        data.append("availability", availabilityStr.trim());
        if (form.profileImage) data.append("profileImage", form.profileImage);

        // TODO: Send data to backend
        alert("Staff member added (demo)\nSubjects: " + subjects.filter(s => s).join(", "));
    };

    return (
        <div className="page-background">
            
            <div className="addstaff-form-container">
                <div className="pt-2 text-center">
                    <h2>Add Staff Member</h2>  
                </div>
                <form className="addstaff-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={form.role} onChange={handleChange} required>
                            <option value="Admin">Admin</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                    </div>
                    {form.role === "Tutor" && (
                         <>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea name="bio" value={form.bio} onChange={handleChange} />
                            </div>
                            <div className="form-group">
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
                            <div className="form-group">
                                <label>Qualifications</label>
                                <textarea name="qualifications" value={form.qualifications} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Availability</label>
                                <div className="availability-block">
                                    <div className="availability-block-row">
                                        <label> Mon-Fri</label>
                                    <input type="checkbox" checked={availability.monFri.enabled}onChange={() => handleAvailabilityToggle("monFri")}/>
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
                                        <label>
                                         Sat-Sun
                                        </label>
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
                        </>
                    )}
                    <div className="form-group">
                        <label>Profile Image</label>
                        <input type="file" name="profileImage" accept="image/*" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                    <button type="submit">Add Staff</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStaff;