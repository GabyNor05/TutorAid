import React from "react";
import FeedbackForm from "./FeedbackForm";

function LessonFeedback() {
    return (
        <div className="page-background">
            <h1 className="page-title text-center mb-10">Lesson Feedback</h1>
            <div className="form-card">
            <FeedbackForm />
            </div>
            
        </div>
    );
}

export default LessonFeedback;