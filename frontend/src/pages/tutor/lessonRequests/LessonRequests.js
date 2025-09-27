import React, { useEffect, useState } from "react";
import LessonCards from "../../generalComponents/lessonCards";

function LessonRequests() {
    const [lessons, setLessons] = useState([]);
    const tutorID = localStorage.getItem("userID");

    useEffect(() => {
        async function fetchLessons() {
            const res = await fetch(`http://localhost:5000/api/lessons?tutorID=${tutorID}`);
            const data = await res.json();
            setLessons(Array.isArray(data) ? data : []);
        }
        fetchLessons();
    }, [tutorID]);

    // Filter lessons by status
    const pendingLessons = lessons.filter(lesson => lesson.status === "pending");
    const acceptedLessons = lessons.filter(lesson => lesson.status === "accepted");
    const declinedLessons = lessons.filter(lesson => lesson.status === "declined");

    // Update lesson status locally and in backend
    const updateLessonStatus = async (lessonID, status) => {
        await fetch("http://localhost:5000/api/lessons/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonID, status })
        });
        setLessons(prev =>
            prev.map(lesson =>
                lesson.lessonID === lessonID ? { ...lesson, status } : lesson
            )
        );
    };

    return (
        <div className="blue-page-background">
            <div style={{display: "flex", flexDirection: "column", alignItems: "left", justifyContent: "left", gap: "20px", paddingBottom: "30px", width: "1000px", margin: "0 auto"}}>
                <h1 className="blue-page-title" style={{display: "flex", justifyContent: "left", margin: "20px"}}>Upcoming Lessons</h1>
                <div style={{display: "flex", flexDirection: "column", alignItems: "left", justifyContent: "left", gap: "20px", paddingBottom: "30px"}}>
                    <h2 className="section-title">Pending Lessons</h2>
                    {pendingLessons.map(lesson => (
                        <LessonCards
                            key={lesson.lessonID}
                            lesson={lesson}
                            showStatus={true}
                            onAccept={() => updateLessonStatus(lesson.lessonID, "accepted")}
                            onDecline={() => updateLessonStatus(lesson.lessonID, "declined")}
                        />
                    ))}

                    <h2 className="section-title">Accepted Lessons</h2>
                    {acceptedLessons.map(lesson => (
                        <LessonCards
                            key={lesson.lessonID}
                            lesson={lesson}
                            showStatus={false}
                            // Add a button to move back to pending or decline
                            onDecline={() => updateLessonStatus(lesson.lessonID, "pending")}
                        />
                    ))}

                    <h2 className="section-title">Declined Lessons</h2>
                    {declinedLessons.map(lesson => (
                        <LessonCards
                            key={lesson.lessonID}
                            lesson={lesson}
                            showStatus={false}
                            // Add a button to move back to pending or accept
                            onAccept={() => updateLessonStatus(lesson.lessonID, "pending")}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LessonRequests;