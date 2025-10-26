import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../../../api/client";

function RequestForm() {
  const [lessonDate, setLessonDate] = useState("");
  const [subjectID, setSubjectID] = useState("");
  const [requestType, setRequestType] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [query, setQuery] = useState("");
  const [studentID, setStudentID] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  // Fetch StudentID from userID
  useEffect(() => {
    async function fetchStudentID() {
      try {
        if (!userID) return;
        const data = await api.get(endpoints.studentByUser(userID));
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.studentID) setStudentID(row.studentID);
      } catch (err) {
        console.error("Error fetching studentID:", err);
      }
    }
    fetchStudentID();
  }, [userID]);

  // Fetch subjects
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const data = await api.get(endpoints.subjects());
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    }
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentID) {
      alert("Student ID is missing. Please log in again.");
      return;
    }
    if (!requestType) {
      alert("Please select a request type.");
      return;
    }

    // Map payload by request type (matches backend: Progress_Note, New_Subject, General_Query)
    const payload = {
      studentID: Number(studentID),
      requestType,
      lessonDate: requestType === "Progress_Note" ? lessonDate || null : null,
      subjectID:
        requestType === "Progress_Note" ? (subjectID ? Number(subjectID) : null) : null,
      newSubjectName: requestType === "New_Subject" ? newSubjectName || null : null,
      newSubjectDescription:
        requestType === "New_Subject" ? newSubjectDescription || null : null,
      query: requestType === "General_Query" ? query || null : null,
    };

    setSubmitting(true);
    try {
      await api.post(endpoints.studentRequests(), payload);
      alert("Request submitted!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Request submit failed:", err);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-background">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center sm:text-left">
          Feedback Requests
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8 mt-4">
          <form
            className="lesson-feedback-form flex flex-col gap-5 text-gray-900"
            onSubmit={handleSubmit}
          >
            {/* Request type */}
            <div className="flex flex-col">
              <label className="feedback-label mb-2">Request Type:</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                required
                className="feedback-input bg-transparent h-11 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
              >
                <option value="">Select Request Category</option>
                <option value="Progress_Note">Request Progress Note</option>
                <option value="New_Subject">Request New Subject</option>
                <option value="General_Query">General Query</option>
              </select>
            </div>

            {/* Progress Note fields */}
            {requestType === "Progress_Note" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="feedback-label mb-2">Date of Lesson:</label>
                  <input
                    type="date"
                    className="feedback-input bg-transparent h-11 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="feedback-label mb-2">Subject Taught:</label>
                  <select
                    id="subject"
                    name="subject"
                    value={subjectID}
                    onChange={(e) => setSubjectID(e.target.value)}
                    required
                    className="feedback-input bg-transparent h-11 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.subjectID} value={sub.subjectID}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* New Subject fields */}
            {requestType === "New_Subject" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="feedback-label mb-2">New Subject Name:</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="feedback-input bg-transparent h-11 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="feedback-label mb-2">Subject Description:</label>
                  <textarea
                    value={newSubjectDescription}
                    onChange={(e) => setNewSubjectDescription(e.target.value)}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    className="feedback-input bg-transparent p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                    rows={2}
                    style={{ minHeight: "44px", resize: "none", overflow: "hidden" }}
                  />
                </div>
              </div>
            )}

            {/* General Query fields */}
            {requestType === "General_Query" && (
              <div className="flex flex-col">
                <label className="feedback-label mb-2">Your Query:</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  className="feedback-input bg-transparent p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full"
                  style={{ minHeight: "44px", resize: "none", overflow: "hidden" }}
                />
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="submit-requests-button w-full sm:w-auto px-6 h-11 rounded-[4px] bg-[#2B5561] text-white font-semibold hover:bg-[#2B5561]/85 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestForm;