const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  process.env.REACT_APP_API_URL || // set this on Vercel to your Render backend URL
  "";

function buildUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path; // relative (dev with proxy)
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
    credentials: extra.credentials || "same-origin",
    signal: extra.signal,
  }).catch((e) => {
    throw new Error(`Network error: ${e.message || e}`);
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  get: (p, extra) => request("GET", p, undefined, extra),
  post: (p, b, extra) => request("POST", p, b, extra),
  put: (p, b, extra) => request("PUT", p, b, extra),
  delete: (p, b, extra) => request("DELETE", p, b, extra),
};

export const endpoints = {
  // auth
  login: () => "/api/login",
  // users
  users: () => "/api/users",
  userById: (id) => `/api/users/${encodeURIComponent(id)}`,
  usersByRole: (role) => `/api/users/role/${encodeURIComponent(role)}`,
  adminGroupUser: () => "/api/users/admin-group",
  // messages
  messages: () => "/api/messages",
  // students
  studentByUser: (userID) => `/api/students/by-user/${encodeURIComponent(userID)}`,
  studentRequests: () => "/api/studentRequests",
  // tutors
  tutorById: (id) => `/api/tutors/${encodeURIComponent(id)}`,
  tutorsBySubject: (subject) => `/api/tutors/by-subject/${encodeURIComponent(subject)}`,
  tutorAvailability: (tutorID) => `/api/tutors/${encodeURIComponent(tutorID)}/availability`,
  // subjects
  subjects: () => "/api/subjects",
};
// Warn if in production without API base
if (typeof window !== "undefined" && !API_BASE && window.location.hostname !== "localhost") {
  // eslint-disable-next-line no-console
  console.warn("REACT_APP_API_URL is not set. API calls will use relative paths.");
}