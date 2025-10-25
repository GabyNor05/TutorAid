import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./booking.css";
import { api, endpoints } from "../../../api/client";
import { analytics } from '../../../lib/analytics';

// Reusable helper
function getAvailableSubjects(tutors, subjects) {
  const tutorsArr = Array.isArray(tutors) ? tutors : [];
  const subjectsArr = Array.isArray(subjects) ? subjects : [];

  const tutorSubjectsSet = new Set();
  tutorsArr.forEach(t => {
    if (typeof t?.subjects === 'string') {
      t.subjects.split(',').forEach(s => s && tutorSubjectsSet.add(s.trim()));
    } else if (Array.isArray(t?.subjects)) {
      t.subjects.forEach(s => s && tutorSubjectsSet.add(String(s).trim()));
    }
  });

  return subjectsArr.filter(s => s?.name && tutorSubjectsSet.has(s.name));
}

// Normalize possible API shapes for tutors
function normalizeTutors(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.tutors)
    ? data.tutors
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data?.rows)
    ? data.rows
    : [];

  return list
    .map((t) => {
      const tutorID =
        t.tutorID ?? t.tutor_id ?? t.id ?? t.tutorUserID ?? t.tutor_user_id ?? null;
      const userID =
        t.userID ?? t.user_id ?? t.user?.userID ?? t.user?.id ?? null;
      const name = t.name ?? t.fullName ?? t.userName ?? t.user?.name ?? "Tutor";
      return { tutorID, userID, name };
    })
    // Accept if we have a name and at least one identifier
    .filter((x) => x.name && (x.tutorID || x.userID));
}

function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [availability, setAvailability] = useState([]);
  const [duration, setDuration] = useState("");
  const [selectedTutorInfo, setSelectedTutorInfo] = useState(null);
  const [loadingTutorInfo, setLoadingTutorInfo] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentUser, setStudentUser] = useState(null); // ADD: user row for name

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
      return times;
  }

  function parseAvailabilityString(availStr) {
      const slots = [];
      if (!availStr || typeof availStr !== "string") {
          return slots;
      }
      availStr.split(";").forEach(part => {
          const colonIndex = part.indexOf(":");
          if (colonIndex === -1) return;
          const days = part.slice(0, colonIndex).trim();
          const times = part.slice(colonIndex + 1).trim();
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

  // ADD: fetch tutor profile (user + tutor) for card
  async function fetchTutorDetails(tutorUserID) {
      if (!tutorUserID) {
          setSelectedTutorInfo(null);
          return;
      }
      setLoadingTutorInfo(true);
      try {
          const [userRes, tutorRes] = await Promise.all([
              api.get(endpoints.userById(tutorUserID)),
              api.get(endpoints.tutorByUser(tutorUserID))
          ]);
          const fee = tutorRes?.fee_per_hour ?? tutorRes?.feePerHour ?? null;
          const bio = tutorRes?.bio || tutorRes?.about || "";
          setSelectedTutorInfo({
              userID: tutorUserID,
              name: userRes?.name || "Tutor",
              image: userRes?.image || "",
              email: userRes?.email || "",
              fee_per_hour: fee,
              bio,
              subjects: tutorRes?.subjects || [],
          });
      } catch (e) {
          setSelectedTutorInfo({
              userID: tutorUserID,
              name: "Tutor",
              image: "",
              email: "",
              fee_per_hour: null,
              bio: "",
              subjects: [],
          });
      } finally {
          setLoadingTutorInfo(false);
      }
  }

  // unchanged: opens modal only (no API call here)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setConfirmError("");
    if (!selectedTutor || !selectedDate || !duration || !selectedSubject) {
      alert("Please fill all fields.");
      return;
    }
    const userID = localStorage.getItem("userID");
    try {
      // Students row gives us studentID (for lessons) and userID (for messages)
      const studentData = await api.get(endpoints.studentByUser(userID));
      if (!studentData?.studentID || !studentData?.userID) {
        alert("Student profile not found.");
        return;
      }
      setStudentInfo(studentData);

      // Fetch the student name from Users table
      try {
        const u = await api.get(endpoints.userById(studentData.userID));
        setStudentUser(u || null);
      } catch {
        setStudentUser(null);
      }

      const startTime = selectedDate.toTimeString().slice(0, 8); // HH:MM:SS
      const lessonPayload = {
        tutorID: Number(selectedTutor),
        studentID: studentData.studentID,
        subject: selectedSubject,
        date: selectedDate.toISOString().slice(0, 10),
        startTime,
        duration: parseInt(duration, 10),
      };
      setPendingBooking(lessonPayload);
      setConfirmOpen(true);
      analytics.event('lesson_booking_started', {
        subject: selectedSubject,
        tutor_id: Number(selectedTutor),
        duration_min: parseInt(duration || '0', 10),
        has_availability: availability.length > 0,
      });
    } catch (err) {
      alert(err.message || "Booking failed");
    }
  };

  // Confirm: include total_fee and create the lesson, then send a message (sender/receiver are userIDs)
  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;
    try {
      const payload = { ...pendingBooking, total_fee: calcTotalFee() };
      const res = await api.post(endpoints.lessons(), payload);
      const lessonID = res?.lessonID;

      // Send a message via messagesController with userIDs
      try {
        let senderUserID = Number(studentInfo?.userID || 0);
        if (!senderUserID) {
          const uid = Number(localStorage.getItem("userID") || 0);
          if (uid) {
            const s = await api.get(endpoints.studentByUser(uid));
            if (s?.userID) {
              setStudentInfo(s);
              senderUserID = Number(s.userID);
              // refresh name if needed
              try { setStudentUser(await api.get(endpoints.userById(s.userID))); } catch {}
            }
          }
        }
        const receiverUserID = Number(selectedTutorUserID || 0);

        if (senderUserID && receiverUserID) {
          const bodyParts = [
            `Subject: ${pendingBooking.subject}`,
            `Date: ${pendingBooking.date}`,
            `Start Time: ${pendingBooking.startTime}`,
            `Duration: ${pendingBooking.duration} minutes`,
            selectedTutorInfo?.fee_per_hour != null ? `Total Fee: R ${calcTotalFee().toFixed(2)}` : null,
            lessonID ? `Lesson ID: ${lessonID}` : null,
          ].filter(Boolean);

          const studentName = studentUser?.name || "A student"; // USE Users.name
          await api.post(endpoints.messages(), {
            senderID: senderUserID,       // Users.userID
            receiverID: receiverUserID,   // Tutor’s Users.userID
            type: 'Lesson Request',
            subject: `${studentName} requested a lesson`,
            body: bodyParts.join("\n"),
          });
        }
      } catch (msgErr) {
        console.warn("Message send failed (lesson was created):", msgErr);
      }

      setConfirmOpen(false);
      setPendingBooking(null);
      alert("Lesson booked!");
      navigate("/dashboard");

      analytics.event('lesson_booking_confirmed', {
        subject: pendingBooking.subject,
        tutor_id: pendingBooking.tutorID,
        duration_min: pendingBooking.duration,
        value: Number(calcTotalFee()),
        currency: 'ZAR',
      });
    } catch (err) {
      setConfirmError(err.message || "Failed to book lesson.");
    }
  };

    // Helpers
    const calcTotalFee = () => {
      const minutes = parseInt(duration, 10) || 0;
      const hours = minutes / 60;
      const rate = Number(selectedTutorInfo?.fee_per_hour || 0);
      return +(hours * rate).toFixed(2);
    };

    const formatDateTime = (d) => {
        if (!d) return "";
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    };

    const [allTutors, setAllTutors] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Fetch all tutors and subjects once to build the available subjects list
  useEffect(() => {
      let cancelled = false;
      (async () => {
          setSubjectsLoading(true);
          try {
              const [tuts, subs] = await Promise.all([
                  api.get(endpoints.tutors()),
                  api.get(endpoints.subjects()),
              ]);
              if (cancelled) return;
              const tArr = Array.isArray(tuts) ? tuts : [];
              const sArr = Array.isArray(subs) ? subs : [];
              setAllTutors(tArr);
              setAllSubjects(sArr);
              setAvailableSubjects(getAvailableSubjects(tArr, sArr));
          } catch {
              setAllTutors([]);
              setAllSubjects([]);
              setAvailableSubjects([]);
          } finally {
              if (!cancelled) setSubjectsLoading(false);
          }
      })();
      return () => {
          cancelled = true;
      };
  }, []);

  // If either list updates, recompute
  useEffect(() => {
      setAvailableSubjects(getAvailableSubjects(allTutors, allSubjects));
  }, [allTutors, allSubjects]);

  const [selectedTutorUserID, setSelectedTutorUserID] = useState(null);

    return (
        <div className="page-background">
            <div className="booking-container mx-auto w-full max-w-4xl px-4 sm:px-6">
                <h2 className="booking-form-title text-center sm:text-left">Book a Lesson</h2>
                <form className="booking-form space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col items-start w-full">
                        <div className="booking-form-group w-full">
                        
                        <div className="booking-top-row grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col justify-center items-start w-full">
                                <label>Subject:</label>
                                <select
                                    className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                                    value={selectedSubject}
                                    onChange={async e => {
                                        const subject = e.target.value;
                                        setSelectedSubject(subject);
                                        setSelectedTutor(""); // reset selected tutorID
                                        setSelectedTutorUserID(null);
                                        setSelectedTutorInfo(null);
                                        setSelectedDate(null);
                                        if (subject) {
                                            try {
                                                const data = await api.get(endpoints.tutorsBySubject(subject));
                                                const list = normalizeTutors(data);
                                                setTutors(list);
                                                analytics.event('subject_selected', { subject });
                                                if (list.length === 0) {
                                                  console.warn("No tutors returned for subject:", subject, data);
                                                }
                                            } catch (err) {
                                              console.error("tutorsBySubject failed:", err);
                                              setTutors([]);
                                            }
                                        } else {
                                            setTutors([]);
                                        }
                                    }}
                                    disabled={subjectsLoading}
                                >
                                    <option value="">Select Subject</option>
                                    {(
                                      availableSubjects.length
                                        ? availableSubjects.map(s => s.name)
                                        : subjectOptions
                                    ).map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                            

                            {tutors.length > 0 && (
                                <div className="flex flex-col justify-center items-start w-full">
                                    <label>Tutor:</label>
                                    <select
                                        className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                                        value={selectedTutor}
                                        onChange={async e => {
                                            const tutorID = Number(e.target.value);
                                            const tObj = tutors.find(t => Number(t.tutorID) === tutorID);
                                            const userID = tObj?.userID ?? null;

                                            setSelectedTutor(String(tutorID));  // always tutorID
                                            setSelectedTutorUserID(userID);     // for profile card
                                            setSelectedDate(null);
                                            setAvailability([]);
                                            setSelectedTutorInfo(null);

                                          if (tutorID) {
                                            try {
                                              const data = await api.get(endpoints.tutorAvailability(tutorID));
                                              const availStr = data?.availability || data?.[0]?.availability || "";
                                              const parsed = parseAvailabilityString(availStr);
                                              setAvailability(parsed);
                                            } catch {
                                              setAvailability([]);
                                            }
                                          }
                                          if (userID) fetchTutorDetails(userID);

                                          analytics.event('tutor_selected', { subject: selectedSubject, tutor_id: tutorID });
                                      }}
                                  >
                                      <option value="">Select Tutor</option>
                                      {tutors.map((tutor) => (
                                        <option key={tutor.tutorID} value={String(tutor.tutorID)}>
                                          {tutor.name}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                            )}
                        </div>
                      </div>

                    {/* Tutor info card stays responsive */}
                    {selectedTutor && (
                        <div className="booking-form-group w-full">
                            <div className="w-full rounded-xl bg-white/90 shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                                <div className="shrink-0">
                                    {loadingTutorInfo ? (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 animate-pulse" />
                                    ) : selectedTutorInfo?.image ? (
                                        <img
                                            src={selectedTutorInfo.image}
                                            alt={selectedTutorInfo.name}
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl">
                                            {(selectedTutorInfo?.name?.[0] || "T").toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <h3 className="text-lg sm:text-xl font-semibold text-[#2B5561] truncate">
                                            {selectedTutorInfo?.name || "Tutor"}
                                        </h3>
                                        <div className="text-sm text-gray-700">
                                            Fee per hour: {selectedTutorInfo?.fee_per_hour != null ? `R ${Number(selectedTutorInfo.fee_per_hour).toFixed(2)}` : "N/A"}
                                        </div>
                                    </div>
                                    {selectedTutorInfo?.email && (
                                        <div className="text-sm text-gray-600 truncate">{selectedTutorInfo.email}</div>
                                    )}
                                    {selectedTutorInfo?.bio && (
                                        <p className="mt-1 text-sm text-gray-700 line-clamp-3">{selectedTutorInfo.bio}</p>
                                    )}
                                    {Array.isArray(selectedTutorInfo?.subjects) && selectedTutorInfo.subjects.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedTutorInfo.subjects.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full border text-xs text-gray-700">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="booking-form-group w-full">
                        <label>Duration:</label>
                        <select
                            className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
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

                    <div className="booking-form-group w-full">
                        <label>Date:</label>
                        <div className="w-full rounded-lg border border-gray-200 p-2 overflow-x-auto">
                            <DatePicker
                                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
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
                    </div>
                    </div>

                    <div className="w-full flex justify-center">
                        <button
                            type="submit"
                            className="login-btn w-full sm:w-3/4 h-12 rounded-[4px] bg-[#2B5561] text-white font-semibold transition hover:bg-[#2B5561]/70"
                        >
                            Book Lesson
                        </button>
                    </div>
                </form>
            </div>

            {/* ADD: Confirmation Modal */}
            {confirmOpen && pendingBooking && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow p-4 sm:p-6">
                        <h3 className="text-xl font-bold text-[#2B5561] mb-3">Confirm Booking</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Subject</span>
                                <span className="font-semibold">{pendingBooking.subject}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tutor</span>
                                <span className="font-semibold">{selectedTutorInfo?.name || pendingBooking.tutorID}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date & Time</span>
                               
                            </div>
                            <div className="flex justify-between">
                                <span>Duration</span>
                                <span className="font-semibold">{pendingBooking.duration} min</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fee per hour</span>
                                <span className="font-semibold">
                                    {selectedTutorInfo?.fee_per_hour != null ? `R ${Number(selectedTutorInfo.fee_per_hour).toFixed(2)}` : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span>Total Fee</span>
                                <span className="font-bold">
                                    {selectedTutorInfo?.fee_per_hour != null ? `R ${calcTotalFee().toFixed(2)}` : "N/A"}
                                </span>
                            </div>
                            {confirmError && <div className="text-red-600 text-sm mt-2">{confirmError}</div>}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setConfirmError("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/70"
                                onClick={handleConfirmBooking}
                                disabled={selectedTutorInfo?.fee_per_hour == null}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Booking;
