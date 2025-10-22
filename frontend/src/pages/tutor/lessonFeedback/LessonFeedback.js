import React from "react";
import FeedbackForm from "./FeedbackForm";
import {useSEO} from '../../../lib/seo';

function LessonFeedback() {
    useSEO({
        title: 'Tutor Aid — Lesson Feedback',
        description: 'University Project: Provide feedback on your tutoring sessions.',
        canonical: 'https://gabydv.xyz/lessonfeedback',
      });
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