const API_BASE =
  process.env.REACT_APP_API_URL || // e.g. https://tutoraid-backend.onrender.com
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  '';

function buildUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path; // absolute
  if (!API_BASE) return path; // dev proxy or same-origin
  // ensure single slash join
  return API_BASE.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
}

async function request(method, url, body, extraHeaders = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = isForm ? { ...extraHeaders } : { 'Content-Type': 'application/json', ...extraHeaders };

  const res = await fetch(buildUrl(url), {
    method,
    headers,
    body: body == null ? undefined : (isForm ? body : JSON.stringify(body)),
    credentials: 'include',
  });

  const text = await res.text();
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? (text ? JSON.parse(text) : {}) : text;

  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`HTTP ${res.status} - ${msg}`);
  }
  return data;
}

export const api = {
  get: (u) => request('GET', u),
  post: (u, b) => request('POST', u, b),
  put: (u, b) => request('PUT', u, b),
  patch: (u, b) => request('PATCH', u, b),
  delete: (u) => request('DELETE', u),
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
  progressNotesLessonNotes: (studentID) => `/api/progress-notes/student/${studentID}`,
  progressNotesStudentPublished: (studentID) => `/api/progressNotes/student/${studentID}/published`,

  lessons: () => '/api/lessons',

  //Admin endpoints
  lessonReports: () => '/api/lessonReports',
  studentRequests: () => `/api/studentRequests`,
  studentRequestsPostpone: () => `/api/studentRequests/postpone`,
  studentRequestsReject: () => `/api/studentRequests/reject`,
  studentRequestsRespond: () => `/api/studentRequests/respond`,
  studentRequestsRevokeAppeal: () => `/api/studentRequests/revoke-appeal`,

  newSubjectRequests: () => `/api/newSubjectRequests`,
  userAvatars: () => `/api/users/user-avatars`,

  progressNotes: () => '/api/progressNotes',
  progressNotesUpload: () => '/api/progressNotes/upload',
  progressNotesPublish: () => `/api/progress-notes/publish`,            // POST { noteID }
  progressNotesPublishById: (noteID) => `/api/progress-notes/${noteID}/publish`, // PATCH alias
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