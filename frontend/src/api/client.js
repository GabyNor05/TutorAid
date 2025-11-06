const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  process.env.REACT_APP_API_URL ||
  "http://192.168.1.54:5000"; // Default API URL

// ADD: alias for backward compatibility (fixes "Export 'API_URL' is not defined")
export const API_URL = API_BASE;

function buildUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path; // dev proxy
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function request(method, path, body, extra = {}) {
  const url = buildUrl(path);
  const isForm = body instanceof FormData;
  const headers = isForm ? {} : { "Content-Type": "application/json" };
  const res = await fetch(url, {
    method,
    headers: { ...headers, ...(extra.headers || {}) },
    body: body == null ? undefined : isForm ? body : JSON.stringify(body),
    mode: "cors",
    credentials: "omit",
    signal: extra.signal,
  }).catch((e) => {
    throw new Error(`Network error: ${e.message || e}`);
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Convenience helpers
export const api = {
  get: (u, o) => request('GET', u, undefined, o),
  post: (u, d, o) => request('POST', u, d, o),
  put: (u, d, o) => request('PUT', u, d, o),
  delete: (u, d, o) => request('DELETE', u, d, o),
};

export const endpoints = {
  
  //Identifiers
  subjectById: (id) => `/api/subjects/${id}`,
  users: () => '/api/users',
  userById: (id) => `/api/users/${id}`,

  // Authentication
  login: () => '/api/users/login',
  sendOtp: () => '/api/users/send-otp',
  verifyOtp: () => '/api/users/verify-otp',
  assignRole: (id) => `/api/users/${id}/assign-role`,
  forgotPasswordRequest: () => `/api/users/forgot-password/request`,
  forgotPasswordVerify: () => `/api/users/forgot-password/verify`,
  resetPasswordById: (id) => `/api/users/${id}/password`,

  // Tutor endpoints
  tutors: () => '/api/tutors',
  subjects: () => '/api/subjects',
  ratings: () => '/api/ratings',
  tutorByUser: (id) => `/api/tutors/by-user/${id}`,
  tutorById: (id) => `/api/tutors/${encodeURIComponent(id)}`,
  updateTutorByUserID: (userID) => `/api/tutors/by-user/${userID}`,
  tutorsBySubject: (subject) => `/api/tutors/by-subject/${encodeURIComponent(subject)}`,
  tutorAvailability: (tutorID) => `/api/tutors/${encodeURIComponent(tutorID)}/availability`,
  feedback: () => `/api/feedback`,
  feedbackList: (query = '') => `/api/feedback${query ? `?${query}` : ''}`,
  feedbackStatus: (id) => `/api/feedback/${id}/status`,
  feedbackById: (id) => `/api/feedback/${id}`,

  // Student endpoints
  students: () => '/api/students',
  studentByUser: (userID) => `/api/students/by-user/${encodeURIComponent(userID)}`,
  progressNotesByStudent: (studentID) => `/api/progressNotes/student/${studentID}`,
  progressNotesLessonNotes: (studentID) => `/api/progressNotes/student/${studentID}`,
  progressNotesStudentPublished: (studentID) => `/api/progressNotes/student/${studentID}/published`,

  lessons: () => '/api/lessons',

  //Admin endpoints
  lessonReports: () => '/api/lessonReports',
  studentRequests: () => '/api/studentRequests',
  lessonReportEscalate: (studentID) => `/api/lessonReports/escalate/${studentID}`,
  lessonReportIgnore: (studentID) => `/api/lessonReports/ignore/${studentID}`,
  progressNotes: () => '/api/progressNotes',
  progressNotesUpload: () => '/api/progressNotes/upload',
  progressNotesPublish: () => `/api/progressNotes/publish`,            // POST { noteID }
  progressNotesPublishById: (noteID) => `/api/progressNotes/${noteID}/publish`, // PATCH
  usersByRole: (role) => `/api/users/role/${encodeURIComponent(role)}`,
  adminGroupUser: () => `/api/users/admin-group`,
  usersChangeStatus: () => `/api/users/change-status`, 
  usersRemove: () => `/api/users/remove-user`, 

  // Back-compat alias (if other code uses 'upload')
  upload: () => '/api/progressNotes/upload',

  // Messaging endpoints
  messages: () => `/api/messages`,
  messagesInbox: (id) => `/api/messages/inbox/${id}`,
  messageMarkRead: (id) => `/api/messages/${id}/read`,
  

  //Newsletter endpoints (Admin)
  newsletterSubscribe: () => '/api/newsletter/subscribe',
  newsletterSubscribers: () => '/api/newsletter/subscribers',
  newsletterUnsubscribe: () => '/api/newsletter/unsubscribe',
  newsletterTemplates: () => '/api/newsletter/templates',
  newsletterTemplateById: (id) => `/api/newsletter/templates/${id}`,
  newsletterSend: () => '/api/newsletter/send',
  
};

export const subjectsApi = {
  list: () => api.get(endpoints.subjects()),
  get: (id) => api.get(endpoints.subjectById(id)),
};

// Normalize subjects into an array
function normalizeSubjects(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
  if (typeof v === 'string') return v.split(/[,\|;]+/).map(s => s.trim()).filter(Boolean);
  return [];
}

// Flexible tutor details fetcher (tries multiple endpoints; merges with Users row)
export async function fetchTutorDetailsFlexible({ userID, tutorID }) {
  let userRow = null;
  try {
    if (userID) userRow = await api.get(endpoints.userById(userID));
  } catch {}

  // Try possible tutor detail endpoints in order
  const attemptUrls = [];
  if (userID) {
    if (endpoints.tutorByUser) attemptUrls.push(endpoints.tutorByUser(userID));     // /api/tutors/by-user/:userID (your current)
    if (endpoints.tutorProfileByUser) attemptUrls.push(endpoints.tutorProfileByUser(userID)); // optional alias
    attemptUrls.push(`/api/tutors/user/${userID}`);
    attemptUrls.push(`/api/tutors/profile/${userID}`);
  }
  if (tutorID) {
    if (endpoints.tutorById) attemptUrls.push(endpoints.tutorById(tutorID));       // /api/tutors/:tutorID
    attemptUrls.push(`/api/tutors/${tutorID}`);
  }

  let tutorDetail = null;
  for (const url of attemptUrls) {
    try {
      tutorDetail = await api.get(url);
      if (tutorDetail) break;
    } catch {
      // try next
    }
  }

  const fee = tutorDetail?.fee_per_hour ?? tutorDetail?.feePerHour ?? null;
  const bio = tutorDetail?.bio || tutorDetail?.about || '';
  const subjects = normalizeSubjects(tutorDetail?.subjects);

  return {
    userID: userRow?.userID ?? userID ?? tutorDetail?.userID ?? null,
    name: userRow?.name ?? tutorDetail?.name ?? 'Tutor',
    image: userRow?.image ?? tutorDetail?.image ?? '',
    email: userRow?.email ?? tutorDetail?.email ?? '',
    fee_per_hour: fee,
    bio,
    subjects,
  };
}

// Try multiple availability URLs and normalize the result to a string
export async function fetchTutorAvailabilityFlexible(tutorID) {
  const urls = [];
  try { if (endpoints?.tutorAvailability) urls.push(endpoints.tutorAvailability(tutorID)); } catch {}
  urls.push(`/api/tutors/${tutorID}/availability`);
  urls.push(`/api/tutors/availability/${tutorID}`);
  urls.push(`/api/availability/${tutorID}`);
  urls.push(`/api/lessons/availability/${tutorID}`);
  urls.push(`/api/tutorAvailability/${tutorID}`);

  for (const url of urls) {
    try {
      const res = await api.get(url);
      const availability =
        res?.availability ??
        res?.schedule ??
        (Array.isArray(res) && res[0]?.availability) ??
        (Array.isArray(res) && res[0]?.schedule) ??
        (typeof res === 'string' ? res : null);
      if (availability) return String(availability);
    } catch {
      // try next
    }
  }
  return '';
}