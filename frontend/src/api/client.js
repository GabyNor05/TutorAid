const API_URL =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // safe if you ever add cookies; harmless otherwise
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
  login: () => '/api/users/login',
  users: () => '/api/users',
};

export { API_URL };