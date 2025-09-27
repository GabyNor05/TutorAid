import React from "react";

function Booking() {
    return (
        <div className="page-background">
            <h1>Booking Page</h1>
            <p>This is where you can book your lessons.</p>
            {/* I need a form where a student can select a subject and amount of time 
            They also need to pick a date from a calendar and a time slot from available times for tutors of that chosen subject
            */}
            <form>
                <label>Subject:</label>
                <select>
                    <option value="math">Math</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                </select>
                <label>Duration:</label>
                <select>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                </select>
                <label>Date:</label>
                <input type="date" />
                <label>Time:</label>
                <select>
                    <option value="9am">9:00 AM</option>
                    <option value="10am">10:00 AM</option>
                    <option value="11am">11:00 AM</option>
                </select>
                <button type="submit">Book Lesson</button>
            </form>
        </div>
    );
}

export default Booking;