import React, { useState, useEffect, useNavigate } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./booking.css";

function Booking() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState("");
    const [availability, setAvailability] = useState([]);
    const [duration, setDuration] = useState("");
    const subjectOptions = [
        "Math", "Afrikaans", "Physics", "Biology", "English", "Zulu", "Sepedi",
        "Math Literacy", "AP Math", "AP English", "AP Biology", "IT", "CAT",
        "History", "Geography", "EMS", "Business Studies", "Accounting", "Homework"
    ];
    const navigate = useNavigate();

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Helper: Map JS day to string
    const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isDateAvailable = date => {
        if (!availability.length) return false;
        const dayName = dayMap[date.getDay()];
        return availability.some(slot => slot.day === dayName);
    };

    function getAvailableTimesForDate(selectedDate, availability) {
        if (!selectedDate || !availability.length) return [];
        const dayName = dayMap[selectedDate.getDay()];
        const slots = availability.filter(slot => slot.day === dayName);
        let times = [];
        slots.forEach(slot => {
            if (!slot.start || !slot.end) return;
            const [startHour, startMin] = slot.start.split(":").map(Number);
            const [endHour, endMin] = slot.end.split(":").map(Number);

            let hour = startHour, min = startMin;
            while (hour < endHour || (hour === endHour && min < endMin)) {
                const time = new Date(selectedDate);
                time.setHours(hour, min, 0, 0);
                times.push(time);
                min += 30;
                if (min >= 60) {
                    min = 0;
                    hour += 1;
                }
            }
        });
        console.log("Available times for", selectedDate, times);
        return times;
    }

    function parseAvailabilityString(availStr) {
        const slots = [];
        if (!availStr || typeof availStr !== "string") {
            console.log("No valid availability string:", availStr);
            return slots;
        }
        availStr.split(";").forEach(part => {
            const colonIndex = part.indexOf(":");
            if (colonIndex === -1) return;
            const days = part.slice(0, colonIndex).trim();
            const times = part.slice(colonIndex + 1).trim();
            // FIX: Split times on "-" not ":"
            const [start, end] = times.split("-").map(s => s.trim());
            if (days.includes("-")) {
                const [startDay, endDay] = days.split("-").map(s => s.trim());
                const startIdx = shortDayMap.indexOf(startDay);
                const endIdx = shortDayMap.indexOf(endDay);
                if (startIdx !== -1 && endIdx !== -1) {
                    if (startIdx <= endIdx) {
                        for (let i = startIdx; i <= endIdx; i++) {
                            slots.push({ day: dayMap[i], start, end });
                        }
                    } else {
                        // Handle wrap-around (e.g., Sat-Sun)
                        for (let i = startIdx; i < shortDayMap.length; i++) {
                            slots.push({ day: dayMap[i], start, end });
                        }
                        for (let i = 0; i <= endIdx; i++) {
                            slots.push({ day: dayMap[i], start, end });
                        }
                    }
                }
            } else if (days.includes(",")) {
                days.split(",").forEach(d => {
                    const idx = shortDayMap.indexOf(d.trim());
                    if (idx !== -1) slots.push({ day: dayMap[idx], start, end });
                });
            } else {
                const idx = shortDayMap.indexOf(days);
                if (idx !== -1) slots.push({ day: dayMap[idx], start, end });
            }
        });
        console.log("Parsed slots:", slots);
        return slots;
    }

    useEffect(() => {
        if (selectedDate && availability.length) {
            const dayName = dayMap[selectedDate.getDay()];
            const slotsForDay = availability.filter(slot => slot.day === dayName);
            console.log("Selected date:", selectedDate);
            console.log("Day name:", dayName);
            console.log("Slots for day:", slotsForDay);
            console.log("Available times:", getAvailableTimesForDate(selectedDate, availability));
        }
    }, [selectedDate, availability]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTutor || !selectedDate || !duration || !selectedSubject) {
            alert("Please fill all fields.");
            return;
        }
        const userID = localStorage.getItem("userID");
        // Fetch studentID from backend
        const res = await fetch(`http://localhost:5000/api/users/students/by-user/${userID}`);
        const studentData = await res.json();
        if (!studentData.studentID) {
            alert("Student profile not found.");
            return;
        }
        const lessonData = {
            tutorID: selectedTutor,
            studentID: studentData.studentID, // Use studentID from Students table
            subject: selectedSubject,
            date: selectedDate.toISOString().slice(0, 10),
            startTime: selectedDate.toTimeString().slice(0, 5),
            duration: parseInt(duration, 10)
        };
        await fetch("http://localhost:5000/api/lessons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lessonData)
        });
        alert("Lesson booked!");
        navigate("/dashboard");
    };

    return (
        <div className="page-background">
            <h1>Booking Page</h1>
            <p>This is where you can book your lessons.</p>
            <div className="booking-container">
                <form className="booking-form" onSubmit={handleSubmit}>
                    <div className="booking-form-group">
                        <div className="booking-top-row">
                            <label>Subject:</label>
                        <select
                            value={selectedSubject}
                            onChange={async e => {
                                const subject = e.target.value;
                                setSelectedSubject(subject);
                                setSelectedTutor(""); // Reset tutor selection
                                if (subject) {
                                    const res = await fetch(`http://localhost:5000/api/users/tutors/by-subject/${encodeURIComponent(subject)}`);
                                    const data = await res.json();
                                    setTutors(data);
                                } else {
                                    setTutors([]);
                                }
                            }}
                        >
                            <option value="">Select Subject</option>
                            {subjectOptions.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    
                    {tutors.length > 0 && (
                        <div className="">
                            <label>Tutor:</label>
                            <select
                                value={selectedTutor}
                                onChange={async e => {
                                    const tutorID = e.target.value;
                                    setSelectedTutor(tutorID);
                                    setSelectedDate(null); // <-- Reset date when tutor changes
                                    if (tutorID) {
                                        const res = await fetch(`http://localhost:5000/api/users/tutor/${tutorID}/availability`);
                                        const data = await res.json();
                                        const parsed = parseAvailabilityString(data[0]?.availability);
                                        setAvailability(parsed);
                                        console.log("Parsed availability:", parsed);
                                    } else {
                                        setAvailability([]);
                                    }
                                }}
                            >
                                <option value="">Select Tutor</option>
                                {tutors.map(tutor => (
                                    <option key={tutor.userID} value={tutor.userID}>{tutor.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                        </div>
                        </div>
                    <div className="booking-form-group">
                        <label>Duration:</label>
                        <select
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        >
                            <option value="">Select Duration</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                            <option value="150">2.5 hours</option>
                            <option value="180">3 hours</option>
                        </select>
                    </div>
                    <div className="booking-form-group">
                        <label>Date:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            minDate={tomorrow}
                            inline
                            showTimeSelect
                            filterDate={isDateAvailable}
                            includeTimes={getAvailableTimesForDate(selectedDate, availability)}
                            disabled={!selectedTutor}
                        />
                    </div>
                    <button type="submit">Book Lesson</button>
                </form>
            </div>
        </div>
    );
}

export default Booking;