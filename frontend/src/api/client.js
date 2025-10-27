const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  process.env.REACT_APP_API_URL ||
  (typeof importMeta !== "undefined" && importMeta.env && importMeta.env.VITE_API_URL) || // safe for Vite builds
  "";

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

  // Tutor endpoints
  tutors: () => '/api/tutors',
  subjects: () => '/api/subjects',
  ratings: () => '/api/ratings',
  tutorByUser: (id) => `/api/tutors/by-user/${id}`,
  tutorById: (id) => `/api/tutors/${encodeURIComponent(id)}`,
  updateTutorByUserID: (userID) => `/api/tutors/by-user/${userID}`,
  tutorsBySubject: (subject) => `/api/tutors/by-subject/${encodeURIComponent(subject)}`,
  tutorAvailability: (tutorID) => `/api/tutors/${encodeURIComponent(tutorID)}/availability`,
  feedback: () => '/api/feedback',

  // Student endpoints
  students: () => '/api/students',
  studentByUser: (userID) => `/api/students/by-user/${encodeURIComponent(userID)}`,
  progressNotesByStudent: (studentID) => `/api/progressNotes/student/${studentID}`,
  progressNotesLessonNotes: (studentID) => `/api/progressNotes/student/${studentID}/lesson-notes`,
  progressNotesStudentPublished: (studentID) => `/api/progressNotes/student/${studentID}/published`,

  lessons: () => '/api/lessons',

  //Admin endpoints
  lessonReports: () => '/api/lessonReports',
  studentRequests: () => '/api/studentRequests',
  lessonReportEscalate: (studentID) => `/api/lessonReports/escalate/${studentID}`,
  progressNotes: () => '/api/progressNotes',
  progressNotesUpload: () => '/api/progressNotes/upload',
  progressNotesPublish: () => '/api/progressNotes/publish',
  usersByRole: (role) => `/api/users/role/${encodeURIComponent(role)}`,
  adminGroupUser: () => `/api/users/admin-group`, // returns { userID, name, ... }

  // Back-compat alias (if other code uses 'upload')
  upload: () => '/api/progressNotes/upload',

  // Messaging endpoints
  messages: () => `/api/messages`,
  messagesInbox: (id) => `/api/messages/inbox/${id}`,
  

  //Newsletter endpoints (Admin)
  newsletterSubscribe: () => '/api/newsletter/subscribe',
  newsletterSubscribers: () => '/api/newsletter/subscribers',
  newsletterUnsubscribe: () => '/api/newsletter/unsubscribe',
  newsletterTemplates: () => '/api/newsletter/templates',
  newsletterTemplateById: (id) => `/api/newsletter/templates/${id}`,
  newsletterSend: () => '/api/newsletter/send',
  
};

export { API_URL };

export const subjectsApi = {
  list: () => api.get(endpoints.subjects()),
  get: (id) => api.get(endpoints.subjectById(id)),
};