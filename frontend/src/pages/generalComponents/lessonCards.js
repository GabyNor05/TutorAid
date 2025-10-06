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
            className="transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-102"
        >
            <div
                className="rounded-lg p-8 mx-auto grid items-center grid-cols-3 gap-5 w-full max-w-4xl bg-gray-50 h-52"
            >
                {/* Image */}
                <div className="flex justify-center items-center">
                    <div className="h-36 w-36 rounded-lg overflow-hidden  flex justify-center items-center">
                        <img
                            src={lesson.studentImage || "https://via.placeholder.com/150"}
                            alt={lesson.studentName}
                            className=""
                        />
                    </div>
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center items-start gap-2">
                    <h3 className="text-lg font-semibold">{lesson.studentName}</h3>
                    <p className="text-gray-700">
                        Date: <span className="font-medium">{formatDate(lesson.date)}</span>, Time: <span className="font-medium">{formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}</span>
                    </p>
                    <p className="text-gray-600">Address: {lesson.address}</p>
                </div>
                {/* Subject & Actions */}
                <div className="grid grid-rows-3 justify-items-end items-center h-full">
                    <div className="bg-yellow-300 text-yellow-900 font-semibold w-20 h-8 rounded-lg flex items-center justify-center mb-2">
                        {lesson.subject}
                    </div>
                    <div></div>
                    {showStatus && (
                        <div className="flex gap-2">
                            <button
                                className="text-green-600 font-semibold hover:underline"
                                onClick={handleAccept}
                            >
                                Accept
                            </button>
                            <button
                                className="text-red-600 font-semibold hover:underline"
                                onClick={handleDecline}
                            >
                                Decline
                            </button>
                        </div>
                    )}
                    {!showStatus && onDecline && (
                        <button
                            className="text-blue-600 font-semibold hover:underline"
                            onClick={onDecline}
                        >
                            Move to Pending
                        </button>
                    )}
                    {!showStatus && onAccept && (
                        <button
                            className="text-blue-600 font-semibold hover:underline"
                            onClick={onAccept}
                        >
                            Move to Pending
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonCards;