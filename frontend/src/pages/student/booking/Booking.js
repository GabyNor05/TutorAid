import React, { useState, useEffect} from "react";
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
    // ADD: tutor details + confirm modal state
    const [selectedTutorInfo, setSelectedTutorInfo] = useState(null);
    const [loadingTutorInfo, setLoadingTutorInfo] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [confirmError, setConfirmError] = useState("");

    const subjectOptions = [
        "Math", "Afrikaans", "Physics", "Biology", "English", "Zulu", "Sepedi",
        "Math Literacy", "AP Math", "AP English", "AP Biology", "IT", "CAT",
        "History", "Geography", "EMS", "Business Studies", "Accounting", "Homework"
    ];
    // const API_URL =  process.env.REACT_APP_API_URL;  // REMOVE
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
        const studentData = await api.get(endpoints.studentByUser(userID));
        if (!studentData?.studentID) {
          alert("Student profile not found.");
          return;
        }
        const lessonPayload = {
          tutorID: selectedTutor,
          studentID: studentData.studentID,
          subject: selectedSubject,
          date: selectedDate.toISOString().slice(0, 10),
          startTime: selectedDate.toTimeString().slice(0, 5),
          duration: parseInt(duration, 10),
        };
        setPendingBooking(lessonPayload);
        setConfirmOpen(true); // only open modal

        analytics.event('lesson_booking_started', {
          subject: selectedSubject,
          tutor_id: selectedTutor,
          duration_min: parseInt(duration || '0', 10),
          has_availability: availability.length > 0,
        });
      } catch (err) {
        alert(err.message || "Booking failed");
      }
    };

    // Confirm: include total_fee and create the lesson
    const handleConfirmBooking = async () => {
      if (!pendingBooking) return;
      try {
        const payload = {
          ...pendingBooking,
          total_fee: calcTotalFee(), // minutes->hours * fee_per_hour
        };
        await api.post(endpoints.lessons(), payload);
        setConfirmOpen(false);
        setPendingBooking(null);
        alert("Lesson booked!");
        navigate("/dashboard");

        analytics.event('lesson_booking_confirmed', {
          subject: pendingBooking.subject,
          tutor_id: pendingBooking.tutorID,
          duration_min: pendingBooking.duration,
          value: Number(calcTotalFee()),   // GA4 monetary value
          currency: 'ZAR',
        });
      } catch (err) {
        setConfirmError(err.message || "Failed to book lesson.");
      }
    };

    // Helpers
    const calcTotalFee = () => {
        const rate = Number(selectedTutorInfo?.fee_per_hour || 0);
        return +(duration * rate).toFixed(2);
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
            <div className="booking-container">
                <form className="booking-form" onSubmit={handleSubmit}>
                    <div className="booking-form-group">
                        <h2 className="booking-form-title">Book a Lesson</h2>
                        <div className="booking-top-row">
                            <div className="flex flex-col justify-center items-start">
                                <label>Subject:</label>
                            <select
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
                                    : subjectOptions // fallback to your static list if API empty/fails
                                ).map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                            </div>
                            

                            {tutors.length > 0 && (
                                <div className="">
                                    <label>Tutor:</label>
                                    <select
                                        value={selectedTutor}
                                        onChange={async e => {
                                            const pickedId = e.target.value; // could be tutorID or userID
                                            // Find the tutor object by matching either id
                                            const tObj = tutors.find(
                                              (t) =>
                                                String(t.tutorID ?? "") === pickedId ||
                                                String(t.userID ?? "") === pickedId
                                            );
                                            const tutorID = tObj?.tutorID ?? null;
                                            const userID = tObj?.userID ?? null;

                                            setSelectedTutor(tutorID ?? userID ?? ""); // for availability, prefer tutorID
                                            setSelectedTutorUserID(userID ?? null);    // for profile card
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

                                            // Load tutor details for the card only if we have userID
                                            if (userID) {
                                              fetchTutorDetails(userID);
                                            }

                                            analytics.event('tutor_selected', { subject: selectedSubject, tutor_id: userID || tutorID });
                                        }}
                                    >
                                        <option value="">Select Tutor</option>
                                        {tutors.map((tutor, idx) => {
                                          const value = String(tutor.tutorID ?? tutor.userID);
                                          return (
                                            <option key={`${value}-${idx}`} value={value}>
                                              {tutor.name}
                                            </option>
                                          );
                                        })}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ADD: Tutor info card (responsive) */}
                    {selectedTutor && (
                        <div className="booking-form-group">
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

                    <button type="submit" className="login-btn w-3/4 h-12 rounded-[4px] bg-[#2B5561] text-white font-semibold transition hover:bg-[#2B5561]/70">Book Lesson</button>
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
                                <span className="font-semibold">{formatDateTime(selectedDate)}</span>
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
