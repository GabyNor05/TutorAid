import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./booking.css";
import { api, endpoints, fetchTutorDetailsFlexible, fetchTutorAvailabilityFlexible } from "../../../api/client";
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
      // IMPORTANT: keep all fields from backend (subjects, fee_per_hour, bio, etc.)
      return { ...t, tutorID, userID, name };
    })
    .filter((x) => x.name && (x.tutorID || x.userID));
}

// ADD: subject normalization and extraction helpers
function normalizeSubjectName(s) {
  if (!s) return "";
  const t = String(s).trim();
  const lower = t.toLowerCase();
  // common corrections
  if (lower === "afrikans") return "Afrikaans";
  return t;
}
function extractSubjectsFromTutors(tutors) {
  const out = new Map(); // key: lower-case name -> display name
  (Array.isArray(tutors) ? tutors : []).forEach(t => {
    const subj = t?.subjects;
    if (!subj) return;
    const arr = Array.isArray(subj) ? subj : String(subj).split(",");
    arr.forEach(x => {
      const n = normalizeSubjectName(x);
      if (!n) return;
      const key = n.toLowerCase();
      if (!out.has(key)) out.set(key, n);
    });
  });
  return Array.from(out.values()).sort((a, b) => a.localeCompare(b));
}
function subjectMatches(tutor, subject) {
  if (!tutor || !subject) return false;
  const target = normalizeSubjectName(subject).toLowerCase();
  const subj = tutor.subjects;
  const arr = Array.isArray(subj) ? subj : String(subj || "").split(",");
  return arr.some(x => normalizeSubjectName(x).toLowerCase() === target);
}

// ADD: tiny helper to format times for the buttons
function fmtTime(d) {
  if (!(d instanceof Date)) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm} ${ampm}`;
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

  // REPLACE your fetchTutorDetails with a call to the flexible getter
  // ADD: fetch tutor profile (user + tutor) for card
  async function fetchTutorDetails({ tutorUserID, tutorID }) {
    setLoadingTutorInfo(true);
    try {
      const info = await fetchTutorDetailsFlexible({ userID: tutorUserID, tutorID });
      setSelectedTutorInfo(info);
    } catch {
      setSelectedTutorInfo({
        userID: tutorUserID ?? null,
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
      // Students row gives us studentID (profile) and userID (FK to users)
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
        studentID: Number(studentData.studentID),
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
    setConfirmError("");
    try {
      const payload = { ...pendingBooking, total_fee: calcTotalFee() };
      console.log("[Booking] create lesson payload:", payload);

      let res;
      try {
        res = await api.post(endpoints.lessons(), payload);
      } catch (err) {
        const msg = String(err?.message || "");
        const detail = String(err?.detail || "");
        const combined = (msg + " " + detail).toLowerCase();

        // Detect FK to users(userID) on server, then retry using userID
        const looksLikeUsersFK =
          combined.includes("er_no_referenced_row_2") &&
          combined.includes("references users (userid)");

        if (looksLikeUsersFK && studentInfo?.userID) {
          const fallback = { ...payload, studentID: Number(studentInfo.userID) };
          console.warn("[Booking] FK mismatch; retry with users.userID", fallback);
          res = await api.post(endpoints.lessons(), fallback);
        } else {
          throw err;
        }
      }

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
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Fetch all tutors once, then compute available subjects from their subjects field
  useEffect(() => {
  let cancelled = false;
  (async () => {
    setSubjectsLoading(true);
    try {
      const tuts = await api.get(endpoints.tutors());
      if (cancelled) return;
      const tArr = Array.isArray(tuts) ? tuts : [];
      setAllTutors(tArr);
      setAvailableSubjects(extractSubjectsFromTutors(tArr));
    } catch {
      if (!cancelled) {
        setAllTutors([]);
        setAvailableSubjects([]);
      }
    } finally {
      if (!cancelled) setSubjectsLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, []);

  const [selectedTutorUserID, setSelectedTutorUserID] = useState(null);

  // Small helper to show date + time in the confirm modal
  const confirmDateTime = useMemo(() => {
    if (!pendingBooking?.date || !pendingBooking?.startTime) return "";
    const time = pendingBooking.startTime?.slice(0, 5); // HH:MM
    // Keep simple YYYY-MM-DD for consistency with your UI
    return `${pendingBooking.date} ${time}`;
  }, [pendingBooking]);

  return (
    // Container: keep full device height, top-aligned
    <div className="page-background min-h-[100dvh] sm:min-h-screen w-full flex justify-center px-4 py-6 md:py-10">
      {/* Card: auto height (grows with form) */}
      <div className="w-full max-w-3xl lg:max-w-4xl bg-white rounded-2xl shadow-md flex flex-col h-auto">
        <div className="p-4 sm:p-6 md:p-8">
          <form className="space-y-5 sm:space-y-6 w-full" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-semibold text-[#2B5561]">Book a Lesson</h2>

            {/* Subject / Tutor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm text-gray-800">Subject</label>
                <select
                  className="w-full h-11 px-3 rounded-lg bg-transparent border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                  value={selectedSubject}
                  onChange={async e => {
                    const subject = e.target.value;
                    setSelectedSubject(subject);
                    setSelectedTutor("");
                    setSelectedTutorUserID(null);
                    setSelectedTutorInfo(null);
                    setSelectedDate(null);
                    setAvailability([]);

                    if (!subject) {
                      setTutors([]);
                      return;
                    }

                    // Try backend endpoint first (if it exists), else fallback to client filter
                    try {
                      const data = await api.get(endpoints.tutorsBySubject(subject));
                      let list = normalizeTutors(data);
                      if (!Array.isArray(list) || list.length === 0) {
                        // Fallback: filter allTutors by subject token
                        const fromAll = (allTutors || []).filter(t => subjectMatches(t, subject));
                        list = fromAll.map(t => ({
                          tutorID: t.tutorID ?? t.id,
                          userID: t.userID ?? t.user_id ?? null,
                          name: t.name ?? "Tutor",
                        })).filter(x => x.name && (x.tutorID || x.userID));
                      }
                      setTutors(list);
                      analytics.event('subject_selected', { subject, tutors_count: list.length });
                    } catch (err) {
                      const fromAll = (allTutors || []).filter(t => subjectMatches(t, subject));
                      const list = fromAll.map(t => ({
                        tutorID: t.tutorID ?? t.id,
                        userID: t.userID ?? t.user_id ?? null,
                        name: t.name ?? "Tutor",
                      })).filter(x => x.name && (x.tutorID || x.userID));
                      setTutors(list);
                      console.warn("tutorsBySubject failed, used client filter:", err);
                    }
                  }}
                  disabled={subjectsLoading}
                >
                  <option value="">Select Subject</option>
                  {(availableSubjects.length ? availableSubjects : subjectOptions).map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {tutors.length > 0 && (
                <div className="flex flex-col w-full">
                  <label className="mb-1 text-sm text-gray-800">Tutor</label>
                  <select
                    className="w-full h-11 px-3 rounded-lg bg-transparent border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                    value={selectedTutor}
                    onChange={async e => {
                      const tutorID = Number(e.target.value);
                      const tObj = tutors.find(t => Number(t.tutorID) === tutorID);
                      const userID = tObj?.userID ?? null;

                      setSelectedTutor(String(tutorID));
                      setSelectedTutorUserID(userID);
                      setSelectedDate(null);
                      setAvailability([]);
                      setSelectedTutorInfo(null);

                      // Availability (flexible)
                      if (tutorID) {
                        try {
                          const availStr = await fetchTutorAvailabilityFlexible(tutorID);
                          const parsed = parseAvailabilityString(availStr);
                          setAvailability(parsed);
                        } catch {
                          setAvailability([]);
                        }
                      }

                      // Build tutor info directly from tutorsBySubject row (preferred)
                      if (tObj) {
                        const subjects = Array.isArray(tObj.subjects)
                          ? tObj.subjects
                          : typeof tObj.subjects === 'string'
                          ? tObj.subjects.split(/[,\|;]+/).map(s => s.trim()).filter(Boolean)
                          : [];

                        const infoFromList = {
                          userID: userID ?? null,
                          name: tObj.name ?? 'Tutor',
                          image: tObj.image ?? '',
                          email: tObj.email ?? '',
                          fee_per_hour: tObj.fee_per_hour ?? tObj.feePerHour ?? null,
                          bio: tObj.bio ?? tObj.about ?? '',
                          subjects,
                        };
                        setSelectedTutorInfo(infoFromList);

                        // If critical fields are still missing, fallback to flexible fetch
                        if (infoFromList.fee_per_hour == null && (userID || tutorID)) {
                          fetchTutorDetails({ tutorUserID: userID, tutorID });
                        }
                      } else if (userID || tutorID) {
                        // Final fallback
                        fetchTutorDetails({ tutorUserID: userID, tutorID });
                      }

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

            {/* Tutor info card */}
            {selectedTutor && (
              <div className="w-full">
                <div className="w-full rounded-xl bg-white/90 border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="shrink-0 self-center sm:self-start">
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

            {/* Duration / Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm text-gray-800">Duration</label>
                <select
                  className="w-full h-11 px-3 rounded-lg bg-transparent border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
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

              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm text-gray-800">Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    if (!date) return setSelectedDate(null);
                    const d = new Date(date);
                    d.setHours(0, 0, 0, 0);
                    setSelectedDate(d);
                  }}
                  placeholderText="Pick a date"
                  className="w-full h-11 px-3 rounded-lg bg-transparent border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                  minDate={tomorrow}
                  showPopperArrow
                  disabled={!selectedTutor}
                  filterDate={isDateAvailable}
                  dateFormat="yyyy-MM-dd"
                />

                {/* Time slots: 2 rows, scrollable horizontally */}
                {selectedDate && (
                  <div className="mt-2">
                    <div className="mb-1 text-sm text-gray-800">Time</div>
                    {/* 4 columns per row, vertical scroll when overflowing */}
                    <div className="max-h-20 overflow-y-auto overflow-x-hidden pr-1">
                      <div className="grid grid-cols-4 gap-2">
                        {getAvailableTimesForDate(selectedDate, availability).map((t) => {
                          const isActive =
                            selectedDate &&
                            t.getHours() === selectedDate.getHours() &&
                            t.getMinutes() === selectedDate.getMinutes();
                          return (
                            <button
                              key={t.toISOString()}
                              type="button"
                              onClick={() => setSelectedDate(new Date(t))}
                              className={`w-full px-2 py-1.5 rounded border text-sm text-center transition
                                ${isActive ? 'bg-[#2B5561] text-white border-[#2B5561]'
                                           : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                              aria-pressed={isActive}
                            >
                              {fmtTime(t)}
                            </button>
                          );
                        })}
                        {getAvailableTimesForDate(selectedDate, availability).length === 0 && (
                          <div className="col-span-full text-sm text-gray-500">
                            No times available for this day. Pick another date.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="w-full flex justify-center mt-4">
              <button
                type="submit"
                className="login-btn w-1/2 h-12 rounded-[4px] bg-[#2B5561] text-white font-semibold transition hover:bg-[#2B5561]/70"
              >
                Book Lesson
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal (unchanged) */}
      {confirmOpen && pendingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 sm:px-6">
          <div className="bg-white w-full max-w-lg rounded-xl shadow p-4 sm:p-6">
            <h3 className="text-xl font-bold text-[#2B5561] mb-3">Confirm Booking</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-3">
                <span>Subject</span>
                <span className="font-semibold text-right">{pendingBooking.subject}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Tutor</span>
                <span className="font-semibold text-right">{selectedTutorInfo?.name || pendingBooking.tutorID}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Date &amp; Time</span>
                <span className="font-semibold text-right">{confirmDateTime || "-"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Duration</span>
                <span className="font-semibold text-right">{pendingBooking.duration} min</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Fee per hour</span>
                <span className="font-semibold text-right">
                  {selectedTutorInfo?.fee_per_hour != null ? `R ${Number(selectedTutorInfo.fee_per_hour).toFixed(2)}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 gap-3">
                <span>Total Fee</span>
                <span className="font-bold text-right">
                  {selectedTutorInfo?.fee_per_hour != null ? `R ${calcTotalFee().toFixed(2)}` : "N/A"}
                </span>
              </div>
              {confirmError && <div className="text-red-600 text-sm mt-2">{confirmError}</div>}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
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
                className="px-4 py-2 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/70 disabled:opacity-60"
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

// Add to your lessons controller create handler before INSERT
// No filepath: paste into the handler that processes POST /api/lessons
// ...existing code...
// Normalize studentID to students.studentID even if client sent users.userID
const sid = Number(req.body.studentID);
let studentID = sid;

// If no such student row, try mapping from users.userID => students.studentID
const [[foundStudentBySID]] = await pool.query(
  "SELECT studentID FROM students WHERE studentID = ? LIMIT 1",
  [studentID]
);
if (!foundStudentBySID) {
  const [[byUser]] = await pool.query(
    "SELECT studentID FROM students WHERE userID = ? LIMIT 1",
    [sid]
  );
  if (byUser?.studentID) studentID = byUser.studentID;
}

// Validate FKs early (return 400 instead of MySQL 500)
const [[s]] = await pool.query("SELECT 1 FROM students WHERE studentID = ? LIMIT 1", [studentID]);
if (!s) return res.status(400).json({ error: "Invalid studentID" });
const [[t]] = await pool.query("SELECT 1 FROM tutors WHERE tutorID = ? LIMIT 1", [tutorID]);
if (!t) return res.status(400).json({ error: "Invalid tutorID" });

// Use normalized studentID in the INSERT
await pool.query(
  "INSERT INTO lessons (tutorID, studentID, subject, date, startTime, duration, total_fee) VALUES (?, ?, ?, ?, ?, ?, ?)",
  [tutorID, studentID, subject, date, startTime, duration, total_fee ?? null]
);
// ...existing code...
