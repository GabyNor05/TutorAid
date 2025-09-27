import React from "react";

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function LessonCards({ lesson, showStatus = true, onAccept, onDecline }) {
    if (!lesson) return null;

    const handleAccept = async () => {
        await fetch("http://localhost:5000/api/lessons/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonID: lesson.lessonID, status: "accepted" })
        });
        if (onAccept) onAccept();
    };

    const handleDecline = async () => {
        await fetch("http://localhost:5000/api/lessons/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonID: lesson.lessonID, studentEmail: lesson.studentEmail, status: "declined" })
        });
        if (onDecline) onDecline();
    };

    return (
        <div
            key={lesson.lessonID}
            className="lesson-cards transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-[102%]"
            style={{ display: "flex", alignItems: "center" }}
        >
            <div
                className="lesson-info"
                style={{
                    borderRadius: "8px",
                    padding: "30px",
                    margin: "0 auto",
                    display: "grid",
                    alignItems: "center",
                    gridTemplateColumns: "1fr 2fr 1fr",
                    gap: "20px",
                    width: "1000px",
                    backgroundColor: "#f9f9f9",
                    height: "200px"
                }}
            >
                <div className="card-imageCol">
                    <div
                        style={{
                            height: "150px",
                            width: "200px",
                            backgroundColor: "#E0E0E0",
                            borderRadius: "8px"
                        }}
                    >
                        <img src={lesson.studentImage || "https://via.placeholder.com/150"} alt={lesson.studentName} />
                    </div>
                </div>
                <div
                    className="card-contentCol"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: "10px"
                    }}
                >
                    <h3>{lesson.studentName}</h3>
                    <p>Date: {formatDate(lesson.date)}, Time: {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}</p>
                    <p>Address: {lesson.address}</p>
                </div>
                <div
                    className="card-subjectCol"
                    style={{
                        display: "grid",
                        gridTemplateRows: "1fr 2fr 1fr",
                        justifyItems: "right",
                        alignItems: "center"
                    }}
                >
                    <div
                        className="subject-badge"
                        style={{
                            background: "#F1B356",
                            width: "65px",
                            height: "30px",
                            borderRadius: "10px",
                            textAlign: "center"
                        }}
                    >
                        {lesson.subject}
                    </div>
                    <div></div>
                    {showStatus && (
                        <div className="card-status">
                            <button className="accept text-green-600 cursor-pointer" onClick={handleAccept}>Accept</button>
                            <button className="decline text-red-600 cursor-pointer" onClick={handleDecline}>Decline</button>
                        </div>
                    )}
                    {!showStatus && onDecline && (
                        <button className="move-to-pending" onClick={onDecline}>Move to Pending</button>
                    )}
                    {!showStatus && onAccept && (
                        <button className="move-to-pending" onClick={onAccept}>Move to Pending</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonCards;