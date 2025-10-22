/* GA4 lightweight wrapper */
const hasGtag = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

function event(name, params = {}) {
  if (!hasGtag()) return;
  window.gtag('event', name, params);
}

function pageView(path, title) {
  if (!hasGtag()) return;
  window.gtag('event', 'page_view', {
    page_path: path || window.location.pathname + window.location.search,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

function setUser(userId, props = {}) {
  if (!hasGtag()) return;
  // user_id (for cross-device) and user_properties (role, plan, etc.)
  window.gtag('config', 'G-CS1K5Z1GG0', { user_id: String(userId) });
  if (props && Object.keys(props).length) {
    window.gtag('set', 'user_properties', props);
  }
}

/* Optional: simple timing helper */
const timers = new Map();
function timeStart(key) { timers.set(key, performance.now()); }
function timeEnd(key, name = 'timing', extra = {}) {
  const start = timers.get(key);
  if (start == null) return;
  const ms = Math.round(performance.now() - start);
  timers.delete(key);
  event(name, { value: ms, unit: 'ms', ...extra });
}

export const analytics = { event, pageView, setUser, timeStart, timeEnd };