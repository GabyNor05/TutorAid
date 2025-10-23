const API_URL =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON regardless of status
  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// Convenience helpers
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
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
  // ADD: published notes for a student
  progressNotesStudentPublished: (studentID) => `/api/progressNotes/student/${studentID}/published`,
};

export { API_URL };


export const subjectsApi = {
  list: () => api.get(endpoints.subjects()),
  get: (id) => api.get(endpoints.subjectById(id)),
};