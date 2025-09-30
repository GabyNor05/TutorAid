import React, { useState, useEffect, useNavigate } from "react";
import "./css/addStaff.css";
import axios from "axios";

function AddStaff() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Admin",
        image: null,
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
    const [subjectOptions, setSubjectOptions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const res = await fetch("http://localhost:5000/api/subjects");
                const data = await res.json();
                setSubjectOptions(data.map(s => s.name));
            } catch (err) {
                console.error("Error fetching subjects:", err);
            }
        }
        fetchSubjects();
    }, []);

    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setForm({ ...form, image: files[0] });
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

    const handleSubmit = async e => {
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
        data.append("image", form.image); // file
        data.append("name", form.name);
        data.append("email", form.email);
        data.append("password", form.password);
        data.append("bio", form.bio);
        data.append("subjects", subjects.filter(s => s).join(", ")); // comma-separated
        data.append("qualifications", form.qualifications);
        data.append("availability", availabilityStr.trim());
        data.append("role", form.role);
        

        // TODO: Send data to backend
        try {
            const response = await axios.post('http://localhost:5000/api/users', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log(response);
            alert("Staff member added!");
            navigate("/dashboard");
        } catch (error) {
            alert("Error adding staff: " + error.response?.data?.error || error.message);
        }
    };

    return (
        <div className="page-background">
            
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
                                    {[0,1,2].map(i => (
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