import React, {useState, useEffect} from "react";
/* import "./feedbackRequest.css"; */
import { useNavigate } from "react-router-dom";

function FeedbackRequests() {
    const [date, setDate] = useState("");
    const [subject, setSubject] = useState("");
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
           
            async function fetchSubjects() {
                try {
                    const res = await fetch("http://localhost:5000/api/subjects");
                    const data = await res.json();
                    setSubjects(data);
                } catch (err) {
                    console.error("Error fetching subjects:", err);
                }
            }
            fetchSubjects();
        }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/dashboard");
    };

    return (
        <div className="page-background">
            {/* I need a form where the students can request feedback to be uploaded on their profile.
             They must select a date, subject,  */}
            <h2>Feedback Requests</h2>
            <div className=" bg-white rounded-xl shadow-lg p-10 max-w-2xl mx-auto">
            <form className="lesson-feedback-form flex flex-col  gap-5 text-gray-900 max-w-xl items-center" onSubmit={handleSubmit}>
                <div className="form-card flex flex-col gap-8 w-9/12">
                    <div className="lesson-feedback-particulars">
                    <div className="lesson-feedback-date w-2/5" style={{display: "flex", flexDirection: "column"}}>
                        <label className="feedback-label mb-2">Date of Lesson:</label>
                        <input type="date" className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="lesson-feedback-subject w-2/5" style={{display: "flex", flexDirection: "column"}}>
                        <label className="feedback-label mb-2">Subject Taught:</label>
                        <select
                            id="subject"
                            name="subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                        >
                            <option value="" className="" onChange={e => setSubject(e.target.value)}>Select Subject</option>
                            {subjects.map(sub => (
    <option key={sub.subjectID} value={sub.name}>{sub.name}</option>
))}
                            
                        </select>
                    </div>
                </div>
            </div>
            <button type="submit" className="submit-feedback-button">Create PDF</button>
            </form>
            </div>
        </div>
    );
}

export default FeedbackRequests;