const API_URL =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

// Normalize base (remove trailing slash)
const BASE = API_URL.replace(/\/+$/, '');

async function request(method, url, data, options = {}) {
  const headers = new Headers(options.headers || {});
  let body;

  const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
  if (!isForm) {
    headers.set('Content-Type', 'application/json');
    if (data !== undefined) body = JSON.stringify(data);
  } else {
    body = data;
  }

  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body,
    credentials: options.credentials || 'omit',   // CHANGED: don’t include cookies by default
  });

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status}${detail ? ` - ${detail}` : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Convenience helpers
export const api = {
  get: (u, o) => request('GET', u, undefined, o),
  post: (u, d, o) => request('POST', u, d, o),
  put: (u, d, o) => request('PUT', u, d, o),
  delete: (u, d, o) => request('DELETE', u, d, o),
};

export const endpoints = {
  tutors: () => '/api/tutors',
  subjects: () => '/api/subjects',
  subjectById: (id) => `/api/subjects/${id}`,
  users: () => '/api/users',
  userById: (id) => `/api/users/${id}`,
  login: () => '/api/users/login',
  sendOtp: () => '/api/users/send-otp',
  verifyOtp: () => '/api/users/verify-otp',
  assignRole: (id) => `/api/users/${id}/assign-role`,
  students: () => '/api/students',
  studentByUser: (id) => `/api/students/by-user/${id}`,
  tutorByUser: (id) => `/api/tutors/by-user/${id}`,
  lessons: () => '/api/lessons',
  lessonReports: () => '/api/lessonReports',
  progressNotes: () => '/api/progressNotes',
  upload: () => '/api/progressNotes/upload',
  feedback: () => '/api/feedback',
  messages: () => '/api/messages',
  messagesInbox: (id) => `/api/messages/inbox/${id}`,
  ratings: () => '/api/ratings',
  tutorsBySubject: (subject) => `/api/tutors/by-subject/${encodeURIComponent(subject)}`,
  tutorAvailability: (tutorID) => `/api/tutors/${encodeURIComponent(tutorID)}/availability`,
  progressNotesStudentPublished: (studentID) => `/api/progressNotes/student/${studentID}/published`,
  studentRequests: () => '/api/studentRequests',
};

export { API_URL };


export const subjectsApi = {
  list: () => api.get(endpoints.subjects()),
  get: (id) => api.get(endpoints.subjectById(id)),
};