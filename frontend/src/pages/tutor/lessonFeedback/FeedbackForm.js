import React, { useState } from "react";
import jsPDF from "jspdf";
import "./lessonFeedback.css";

function FeedbackForm() {
    const [rating, setRating] = useState(3);
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState("");
    const [punctual, setPunctual] = useState(false);
    const [setwork, setSetwork] = useState("");
    const [comments, setComments] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create PDF
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Lesson Feedback", 10, 10);
        doc.text(`Date of Lesson: ${date}`, 10, 20);
        doc.text(`Subject Taught: ${subject}`, 10, 30);
        doc.text(`Student On Time: ${punctual ? "Yes" : "No"}`, 10, 40);
        doc.text(`Setwork Covered: ${setwork}`, 10, 50);
        doc.text(`Participation Rating: ${rating}`, 10, 60);
        doc.text("Additional Comments:", 10, 70);
        doc.text(comments, 10, 80);

        doc.save("lesson-feedback.pdf");
    };

    const subjectOptions = [
    "Math", "Afrikaans", "Physics", "Biology", "English", "Zulu", "Sepedi",
    "Math Literacy", "AP Math", "AP English", "AP Biology", "IT", "CAT",
    "History", "Geography", "EMS", "Business Studies", "Accounting", "Homework"
    ];
    return (
        
        <div>
            <h2>Lesson Feedback</h2>
            <form className="lesson-feedback-form" onSubmit={handleSubmit}>
                <div className="lesson-feedback-particulars">
                    <div className="lesson-feedback-date" style={{display: "flex", flexDirection: "column"}}>
                        <label className="feedback-label">Date of Lesson:</label>
                        <input type="date" className="feedback-input" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="lesson-feedback-subject" style={{display: "flex", flexDirection: "column"}}>
                        <label>Subject Taught:</label>
                        <select
                            id="subject"
                            name="subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjectOptions.map(subject => (
                                <option key={subject} value={subject.toLowerCase()}>{subject}</option>
                            ))}
                            
                        </select>
                    </div>
                </div>
                <div className="lesson-feedback-puctuality">
                    <label className="feedback-label">Was the student on time for their lesson?</label>
                    <input type="checkbox" className="feedback-checkbox" checked={punctual} onChange={e => setPunctual(e.target.checked)} />
                </div>
                <div className="lesson-feedback-setwork" style={{display: "flex", flexDirection: "column"}}>
                    <label className="feedback-label">What did you cover in the lesson?</label>
                    <input type="text" className="feedback-input" placeholder="E.g., Algebra, Geometry, etc." value={setwork} onChange={e => setSetwork(e.target.value)} />
                </div>
                <div className="lesson-feedback-rating">
                    <label className="feedback-label">
                        Rate the student's participation during the lesson:
                    </label>
                    <div className="rating-bar">
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={rating}
                            onChange={e => setRating(Number(e.target.value))}
                            className="rating-slider"
                        />
                        <span className="rating-value">{rating}</span>
                    </div>
                </div>
                <div className="lesson-feedback-comments">
                    <label className="feedback-label">Additional comments about the lesson:</label>
                    <textarea className="feedback-textarea" rows="4" placeholder="Enter your comments here..." value={comments} onChange={e => setComments(e.target.value)} />
                </div>
                <button type="submit" className="submit-feedback-button">Create PDF</button>
            </form>
            <div className="report-link">
                        <p>Don't have an account?</p> 
                        <a href="/reportform">Report</a>
                    </div>
        </div>
    );
}

export default FeedbackForm;