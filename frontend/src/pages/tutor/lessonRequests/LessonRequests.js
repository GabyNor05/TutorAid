import React, { useEffect, useState } from "react";
import LessonCards from "../../generalComponents/lessonCards";
import { api, endpoints } from "../../../api/client"; 

function LessonRequests() {

  const [lessons, setLessons] = useState([]);
  const [tutorIDs, setTutorIDs] = useState({ userID: null, tutorID: null }); 

  useEffect(() => {
    const userID = Number(localStorage.getItem("userID"));
    if (!userID) return;

    // 1) Resolve tutorID from userID
    (async () => {
      try {
        const t = await api.get(endpoints.tutorByUser(userID));
        const tutorID = t?.tutorID || (Array.isArray(t) && t[0]?.tutorID) || null;
        setTutorIDs({ userID, tutorID });

        // 2) Fetch lessons for this tutor
        if (tutorID) {
          const data = await api.get(`${endpoints.lessons()}?tutorID=${tutorID}`);
          setLessons(Array.isArray(data) ? data : []);
        } else {
          setLessons([]);
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setLessons([]);
      }
    })();
  }, []);

  // Filter lessons by status
  const pendingLessons = lessons.filter(lesson => lesson.status === "pending");
  const acceptedLessons = lessons.filter(lesson => lesson.status === "accepted");
  const declinedLessons = lessons.filter(lesson => lesson.status === "declined");

  // Send a status update message to the student (similar to Dashboard’s message flow)
  const sendStatusMessage = async (lesson, newStatus) => {
    try {
      // Sender: Tutor (tutorID), Receiver: Student (studentID) — matching existing Dashboard pattern
      await api.post(endpoints.messages(), {
        type: "Lesson Update",
        subject: newStatus === "accepted" ? "Lesson Accepted" : "Lesson Declined",
        body: [
          `Your lesson request has been ${newStatus}.`,
          `Subject: ${lesson.subject}`,
          `Date: ${lesson.date}`,
          `Start Time: ${lesson.startTime}`,
          `Duration: ${lesson.duration} minutes`,
          lesson.total_fee != null ? `Total Fee: R ${Number(lesson.total_fee).toFixed(2)}` : null,
          `Lesson ID: ${lesson.lessonID}`,
        ].filter(Boolean).join('\n'),
        senderID: tutorIDs.tutorID,      // Tutor as sender
        receiverID: lesson.studentID,     // Student as receiver
      });
    } catch (err) {
      console.warn("Failed to send status message (lesson status updated):", err);
    }
  };

  // Update lesson status locally and in backend, then notify student
  const updateLessonStatus = async (lessonID, status) => {
    try {
      await api.post(`${endpoints.lessons()}/update-status`, { lessonID, status });

      // Find lesson for composing the message
      const lesson = lessons.find(l => l.lessonID === lessonID);
      if (lesson && (status === "accepted" || status === "declined")) {
        await sendStatusMessage(lesson, status);
      }

      // Update UI
      setLessons(prev =>
        prev.map(lesson =>
          lesson.lessonID === lessonID ? { ...lesson, status } : lesson
        )
      );
    } catch (err) {
      console.error("Failed to update lesson status:", err);
    }
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
              onDecline={() => updateLessonStatus(lesson.lessonID, "pending")}
            />
          ))}

          <h2 className="section-title">Declined Lessons</h2>
          {declinedLessons.map(lesson => (
            <LessonCards
              key={lesson.lessonID}
              lesson={lesson}
              showStatus={false}
              onAccept={() => updateLessonStatus(lesson.lessonID, "pending")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LessonRequests;