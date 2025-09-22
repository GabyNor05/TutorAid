import React, { useState } from "react";
import "./lessonFeedback.css";

function FeedbackForm() {
    const [rating, setRating] = useState(3);
    const [subject, setSubject] = useState("");
    const [errors, setErrors] = useState({});

    return (
        <div >
            <h2>Lesson Feedback</h2>
            <form className="lesson-feedback-form">
                
                {/* I want the first elementr of the form to be a row label and checkbox */}
                {/* Next element label below that a rating bare from one to 5 */}
                {/* Next a label below that text area input field  */}
                {/* Next another row Label  */}
                <div className ="lesson-feedback-particulars">
                    <div className="lesson-feedback-date" style={{display: "flex", flexDirection: "column"}}>
                        <label className="feedback-label">Date of Lesson:</label>
                        <input type="date" className="feedback-input" />
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
                                <option value="Math">Eastern Cape</option>
                                <option value="Afrikaans">Afrikaans</option>
                                <option value="Physics">Physics</option>
                                <option value="Biology">Biology</option>
                                <option value="English">English</option>
                                <option value="Zulu">Zulu</option>
                                <option value="Sepedi">Sepedi</option>
                                <option value="Math Literacy">Math Literacy</option>
                                <option value="AP Math">AP Math</option>
                                <option value="AP English">AP English</option>
                                <option value="AP Biology">AP Biology</option>
                                <option value="IT">IT</option>
                                <option value="CAT">CAT</option>
                                <option value="History">Western Cape</option>
                                <option value="Geography">Geography</option>
                                <option value="EMS">EMS</option>
                                <option value="Business Studies">Business Studies</option>
                                <option value="Accounting">Accounting</option>
                                <option value="Homework">Homework</option>
                            </select>
                            {errors.subject && (
                                <span style={{ color: "red", fontSize: "12px" }}>{errors.subject}</span>
                            )}
                    </div>
                </div>
                <div className="lesson-feedback-puctuality">
                    <label className="feedback-label">Was the student on time for their lesson?</label>
                    <input type="checkbox" className="feedback-checkbox" />
                </div>
                <div className="lesson-feedback-setwork">
                    <label className="feedback-label">What did you cover in the lesson?</label>
                    <input type="text" className="feedback-input " placeholder="E.g., Algebra, Geometry, etc." />
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
                    <textarea className="feedback-textarea" rows="4" placeholder="Enter your comments here..."></textarea>
                </div>
                
                <button type="submit" className="submit-feedback-button">Submit Feedback</button>
                <div className="report-link">
                        <p>Would you like to report the Lesson?</p> 
                        <a href="/" style={{color: "red"}}>Report</a>
                </div> 
            </form>   
            
        </div>
    );
}
export default FeedbackForm;