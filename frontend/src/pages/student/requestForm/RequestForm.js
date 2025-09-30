import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RequestForm() {
    const [lessonDate, setLessonDate] = useState("");
    const [subjectID, setSubjectID] = useState("");
    const [requestType, setRequestType] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [newSubjectDescription, setNewSubjectDescription] = useState("");
    const [query, setQuery] = useState("");
    const [studentID, setStudentID] = useState("");
    const navigate = useNavigate();

    const userID = localStorage.getItem("userID");

    useEffect(() => {
        async function fetchStudentID() {
            try {
                const res = await fetch(`http://localhost:5000/api/students/by-user/${userID}`);
                const data = await res.json();
                setStudentID(data.studentID); // Make sure this is a valid number
            } catch (err) {
                console.error("Error fetching studentID:", err);
            }
        }
        if (userID) fetchStudentID();
    }, [userID]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

    console.log("studentID before submit:", studentID);
    if (!studentID) {
      alert("Student ID is missing. Please log in again.");
      return;
    }
        const requestData = {
            studentID,
            requestType,
            lessonDate: requestType === "progress_note" ? lessonDate : null,
            subjectID: requestType === "progress_note" ? subjectID : null,
            newSubjectName: requestType === "add_subject" ? newSubjectName : null,
            newSubjectDescription: requestType === "add_subject" ? newSubjectDescription : null,
            query: requestType === "general" ? query : null
        };

        try {
            const res = await fetch("http://localhost:5000/api/studentRequests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });
            if (res.ok) {
                alert("Request submitted!");
                navigate("/dashboard");
            } else {
                alert("Failed to submit request.");
            }
        } catch (err) {
            alert("Error submitting request.");
        }
    };


    return (
        <div className="page-background">
            <h2>Feedback Requests</h2>
            <div className="bg-white rounded-xl shadow-lg p-10 max-w-2xl mx-auto">
                <form className="lesson-feedback-form flex flex-col gap-5 text-gray-900 max-w-xl items-center" onSubmit={handleSubmit}>
                    <div className="form-card flex flex-col gap-8 w-9/12">
                        <div className="lesson-feedback-particulars">
                            <div className="lesson-feedback-type w-full" style={{ display: "flex", flexDirection: "column" }}>
                                <label className="feedback-label mb-2">Request Type:</label>
                                <select
                                    value={requestType}
                                    onChange={e => setRequestType(e.target.value)}
                                    required
                                    className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                                >
                                    <option value="">Select Request Category</option>
                                    <option value="progress_note">Request Progress Note</option>
                                    <option value="add_subject">Request New Subject</option>
                                    <option value="general">General Query</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {requestType === "progress_note" && (
                        <div className="flex flex-col gap-8 w-9/12 lesson-feedback-particulars">
                            <div className="lesson-feedback-date w-2/5" style={{ display: "flex", flexDirection: "column" }}>
                                <label className="feedback-label mb-2">Date of Lesson:</label>
                                <input type="date" className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full" value={lessonDate} onChange={e => setLessonDate(e.target.value)} />
                            </div>
                            <div className="lesson-feedback-subject w-2/5" style={{ display: "flex", flexDirection: "column" }}>
                                <label className="feedback-label mb-2">Subject Taught:</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={subjectID}
                                    onChange={e => setSubjectID(e.target.value)}
                                    required
                                    className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.subjectID} value={sub.subjectID}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {requestType === "add_subject" && (
                        <div className="lesson-feedback-new-subject w-9/12 flex flex-col items-start">
                            <label className="feedback-label mb-2">New Subject Name:</label>
                            <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full" />
                            <label className="feedback-label mb-2">Subject Description:</label>
                            <textarea
                              value={newSubjectDescription}
                              onChange={e => setNewSubjectDescription(e.target.value)}
                              onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              className="feedback-input bg-transparent p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                              rows={2}
                              style={{ minHeight: "40px", resize: "none", overflow: "hidden" }}
                            />
                        </div>
                    )}

                    {requestType === "general" && (
                        <div className="lesson-feedback-general w-9/12" style={{ display: "flex", flexDirection: "column" }}>
                            <label className="feedback-label mb-2">Your Query:</label>
                            <textarea
                              value={query}
                              onChange={e => setQuery(e.target.value)}
                              onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              className="feedback-input bg-transparent p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                              style={{ minHeight: "40px", resize: "none", overflow: "hidden" }}
                            />
                        </div>
                    )}
                    <button type="submit" className="submit-requests-button">Submit Request</button>
                </form>
            </div>
        </div>
    );
}

export default RequestForm;