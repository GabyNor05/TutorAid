import React, { useState, useEffect } from "react";
import "./reportForm.css";
import { CaretLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

function ReportForm() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [reportDate, setReportDate] = useState("");
    const [subject, setSubject] = useState("");
    const [comments, setComments] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
            async function fetchStudents() {
                try {
                    const res = await fetch("http://localhost:5000/api/students");
                    const data = await res.json();
                    setStudents(data);
                } catch (err) {
                    console.error("Error fetching students:", err);
                }
            }
            fetchStudents();
        }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Find the studentID for the selected student name
        const studentObj = students.find(s => s.name === selectedStudent);
        if (!studentObj) {
            alert("Please select a valid student.");
            return;
        }

        const reportData = {
            studentID: studentObj.studentID,
            subject,
            reportDate,
            comments
        };

        try {
            const res = await fetch("http://localhost:5000/api/lessonReports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reportData)
            });
            if (res.ok) {
                alert("Report submitted!");
                navigate("/dashboard"); 
            } else {
                alert("Failed to submit report.");
            }
        } catch (err) {
            console.error("Error submitting report:", err);
            alert("Error submitting report.");
        }
    };

    return (
        <div className="page-background">
            <div className="back-button flex flex-row items-center mb-6 cursor-pointer" onClick={() => window.history.back()}>
                <CaretLeft size={20} />
                <span className="back-text text-xl"> Back</span>
            </div>
            <div className=" bg-white rounded-xl shadow-lg p-10 max-w-2xl mx-auto ">
                <form className="lesson-feedback-form flex flex-col  gap-5 text-gray-900 max-w-xl items-center" onSubmit={handleSubmit}>
                    <h2 className="items-center">Report Form</h2>
                    <div className="form-section flex flex-col gap-8 w-9/12">
                        
                        <div className="lesson-feedback-particulars">
                            <div className="lesson-feedback-date w-2/5" style={{display: "flex", flexDirection: "column"}}>
                                <label className="feedback-label mb-2">Date of Report:</label>
                                <input
                                    type="date"
                                    className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                                    value={reportDate}
                                    onChange={e => setReportDate(e.target.value)}
                                />
                            </div>
                            <div className="lesson-feedback-subject w-2/5" style={{display: "flex", flexDirection: "column"}}>
                                <label className="feedback-label mb-2">Subject:</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className="feedback-input bg-transparent h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Math">Math</option>
                                    <option value="English">English</option>
                                    <option value="Science">Science</option>
                                </select>
                            </div>
                        </div>
                    
                    <div className="lesson-feedback-student" style={{display: "flex", flexDirection: "column"}}>
                    <label className="mb-2">Student Name:</label>
                    <input
                        type="text"
                        list="student-list"
                        value={selectedStudent}
                        onChange={e => setSelectedStudent(e.target.value)}
                        placeholder="Search for a student..."
                        required
                        className="feedback-input h-10 w-full p-2 rounded-lg border-2 border-gray-300 shadow-inner"
                    />
                    <datalist id="student-list">
                        {students.map(student => (
                            <option key={student.studentID} value={student.name} />
                        ))}
                    </datalist>
                </div>
                    <div className="lesson-feedback-comments " style={{display: "flex", flexDirection: "column"}}>
                        <label className="feedback-label mb-2">Details of Report:</label>
                        <textarea
                            className="feedback-textarea p-2 rounded-lg border-2 border-gray-300 shadow-inner"
                            rows="4"
                            placeholder="Enter details here..."
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                        />
                    </div>
                    </div>
                    <div>
                        <button className="submit-report-button mt-2" type="submit">Submit Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportForm;