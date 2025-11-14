import React from "react";
import { api, endpoints } from "../../api/client"; // <-- add import

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

function LessonCards({
    lesson,
    role,
    tutorImage,
    tutorName,
    showStatus = false,
    onAccept,
    onDecline,
    onContactTutor,
    onRateTutor
}) {
    if (!lesson) return null;

    const roleKey = String(role || '').toLowerCase();
    const status = String(lesson.status || '').toLowerCase(); // normalized

    const displayImage =
        roleKey === "student"
            ? tutorImage || "https://via.placeholder.com/150"
            : lesson.studentImage || "https://via.placeholder.com/150";
    const displayName = roleKey === "student" ? tutorName : lesson.studentName;

    const handleAccept = async () => {
        if (roleKey !== 'tutor') return;
        try {
            await api.post(`${endpoints.lessons()}/update-status`, {
                lessonID: lesson.lessonID,
                status: "accepted",
            });
            onAccept && onAccept();
        } catch (e) { console.error("Accept failed:", e); }
    };

    const handleDecline = async () => {
        if (roleKey !== 'tutor') return;
        try {
            await api.post(`${endpoints.lessons()}/update-status`, {
                lessonID: lesson.lessonID,
                studentEmail: lesson.studentEmail,
                status: "declined",
            });
            onDecline && onDecline();
        } catch (e) { console.error("Decline failed:", e); }
    };

    const statusColor = {
        pending: "bg-orange-200 text-orange-800",
        accepted: "bg-green-200 text-green-800",
        declined: "bg-red-200 text-red-800",
        completed: "bg-blue-200 text-blue-800"
    }[status] || "bg-gray-200 text-gray-800";

    return (
        <div key={lesson.lessonID} className="transition hover:-translate-y-1 hover:scale-105">
            <div className="rounded-lg mx-auto w-full bg-gray-50 p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-center md:h-52">
                {/* Image */}
                <div className="flex justify-center md:justify-start items-center">
                    <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 rounded-lg overflow-hidden flex justify-center items-center bg-white">
                        <img src={displayImage} alt={displayName} className="h-full w-full object-cover" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center items-start gap-2 w-full">
                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <h3 className="text-base sm:text-lg font-semibold">{displayName}</h3>
                        <span className="md:hidden bg-yellow-300 text-yellow-900 font-semibold px-2 py-1 rounded-lg">
                            {lesson.subject}
                        </span>
                        {roleKey === 'student' && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                            {status || 'unknown'}
                          </span>
                        )}
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Date: <span className="font-medium">{formatDate(lesson.date)}</span>, Time:{" "}
                        <span className="font-medium">
                            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        </span>
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">Address: {lesson.address}</p>

                    {/* Student buttons only (regardless of status) */}
                    {roleKey === "student" && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                            <button
                                className="bg-[var(--Wall-Teal)] text-white px-3 py-2 rounded hover:bg-[var(--Wall-Teal-Light)] w-full sm:w-auto"
                                onClick={onContactTutor}
                            >
                                Contact Tutor
                            </button>
                            <button
                                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto"
                                onClick={onRateTutor}
                            >
                                Rate Tutor
                            </button>
                        </div>
                    )}

                    {/* Tutor Accept/Decline (mobile) */}
                    {roleKey === 'tutor' && showStatus && (
                        <div className="flex md:hidden gap-4 mt-1">
                            <button className="text-green-600 font-semibold hover:underline" onClick={handleAccept}>Accept</button>
                            <button className="text-red-600 font-semibold hover:underline" onClick={handleDecline}>Decline</button>
                        </div>
                    )}
                </div>

                {/* Subject & Actions (desktop-right) */}
                <div className="hidden md:grid grid-rows-3 justify-items-end items-center h-full">
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-yellow-300 text-yellow-900 font-semibold w-20 h-8 rounded-lg flex items-center justify-center">
                            {lesson.subject}
                        </div>
                        {roleKey === 'student' && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                            {status || 'unknown'}
                          </span>
                        )}
                    </div>
                    <div />
                    {roleKey === 'tutor' && showStatus && (
                        <div className="flex gap-2">
                            <button className="text-green-600 font-semibold hover:underline" onClick={handleAccept}>Accept</button>
                            <button className="text-red-600 font-semibold hover:underline" onClick={handleDecline}>Decline</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonCards;