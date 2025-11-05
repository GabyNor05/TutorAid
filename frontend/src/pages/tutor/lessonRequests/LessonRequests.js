import React, { useEffect, useState } from "react";
import LessonCards from "../../generalComponents/lessonCards";
import { api, endpoints } from "../../../api/client"; 

function LessonRequests() {
  const [lessons, setLessons] = useState([]);
  const [tutorIDs, setTutorIDs] = useState({ userID: null, tutorID: null }); 
  const [error, setError] = useState("");

  // Helpers
  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.lessons)) return data.lessons;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const statusOf = (l) => {
    const raw = l?.status ?? l?.lesson_status ?? l?.requestStatus ?? l?.state ?? "";
    return String(raw).toLowerCase();
  };
  const isOneOf = (l, names) => names.includes(statusOf(l));

  // Try to resolve tutorID from various endpoints/shapes
  async function resolveTutorID(userID) {
    // 1) Preferred: /api/tutors/by-user/:userID
    try {
      const t = await api.get(endpoints.tutorByUser(userID));
      if (t?.tutorID) return t.tutorID;
      if (Array.isArray(t) && t[0]?.tutorID) return t[0].tutorID;
      if (t?.tutor?.tutorID) return t.tutor.tutorID;
    } catch {}

    // 2) Fallback: list all tutors and find by userID
    try {
      const all = await api.get(endpoints.tutors());
      const list = normalizeArray(all);
      const found = list.find(x => Number(x.userID ?? x.user_id) === Number(userID));
      if (found?.tutorID ?? found?.tutor_id) return Number(found.tutorID ?? found.tutor_id);
    } catch {}

    // 3) Last-resort: alt routes seen in some backends
    try {
      const t = await api.get(`/api/tutors/user/${userID}`);
      if (t?.tutorID) return t.tutorID;
    } catch {}

    return null;
  }

  // Try multiple lesson endpoints
  async function fetchLessonsForTutor(tutorID) {
    const urls = [
      `${endpoints.lessons()}?tutorID=${tutorID}`,
      `/api/lessons/by-tutor/${tutorID}`,
      `/api/lessons/tutor/${tutorID}`,
      `/api/lessons/requests?tutorID=${tutorID}`,
      `/api/lessons/pending?tutorID=${tutorID}`,
    ];
    for (const url of urls) {
      try {
        const data = await api.get(url);
        const arr = normalizeArray(data);
        if (arr.length) return arr;
      } catch {
        // try next
      }
    }
    // As a final attempt, return empty array if none worked
    return [];
  }

  useEffect(() => {
    (async () => {
      setError("");
      const userID = Number(localStorage.getItem("userID"));
      if (!userID) {
        setError("Not logged in as a tutor.");
        return;
      }

      try {
        const tutorID = await resolveTutorID(userID);
        setTutorIDs({ userID, tutorID });

        if (!tutorID) {
          setLessons([]);
          setError("Could not resolve tutor ID for this user.");
          console.warn("[LessonRequests] No tutorID for userID:", userID);
          return;
        }

        const list = await fetchLessonsForTutor(tutorID);
        setLessons(Array.isArray(list) ? list : []);
        if (!list.length) {
          setError("No lessons returned by the server.");
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setLessons([]);
        setError("Failed to fetch lessons.");
      }
    })();
  }, []);

  // Flexible status grouping (covers Pending/Requested naming differences)
  const pendingLessons = lessons.filter(l => isOneOf(l, ["pending", "requested", "awaiting", "waiting"]));
  const acceptedLessons = lessons.filter(l => isOneOf(l, ["accepted", "approved", "confirmed"]));
  const declinedLessons = lessons.filter(l => isOneOf(l, ["declined", "rejected"]));

  const sendStatusMessage = async (lesson, newStatus) => {
    try {
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
        senderID: tutorIDs.tutorID,
        receiverID: lesson.studentID,
      });
    } catch (err) {
      console.warn("Failed to send status message (lesson status updated):", err);
    }
  };

  const updateLessonStatus = async (lessonID, status) => {
    try {
      await api.post(`${endpoints.lessons()}/update-status`, { lessonID, status });
      const lesson = lessons.find(l => l.lessonID === lessonID);
      if (lesson && (status === "accepted" || status === "declined")) {
        await sendStatusMessage(lesson, status);
      }
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

        {error && (
          <div style={{ color: "#b91c1c", marginLeft: 20 }}>{error}</div>
        )}

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