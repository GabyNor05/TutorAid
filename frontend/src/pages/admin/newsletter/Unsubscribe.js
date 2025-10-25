import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, endpoints } from "../../../api/client";
import { analytics } from "../../../lib/analytics";

function Unsubscribe() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get("email");
    if (e) setEmail(e);
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const clean = String(email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setMsg("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      // Only email is required by the backend; reason is optional (ignored if not stored)
      await api.post(endpoints.newsletterUnsubscribe(), { email: clean });

      setSuccess(true);
      const domain = clean.split("@")[1] || "";
      analytics.event("newsletter_unsubscribed", {
        email_domain: domain,
        reason: reason === "other" ? otherReason : reason || "unspecified",
      });
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setMsg("Unsubscribe failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4 sm:px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#2B5561] mb-2">You’re unsubscribed</h1>
          <p className="text-gray-700">
            We’ve removed <strong>{email}</strong> from our mailing list.
          </p>
          <p className="text-gray-600 mt-2">
            Changed your mind? You can resubscribe anytime from our homepage footer.
          </p>
          <a
            href="/"
            className="inline-block mt-5 px-5 py-2 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/85"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] grid place-items-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-[#2B5561] mb-1">Unsubscribe</h1>
        <p className="text-gray-600 mb-5">
          Enter your email to stop receiving Tutor Aid newsletters.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-2">Why are you unsubscribing? (optional)</label>
            <div className="grid grid-cols-1 gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="too_many_emails"
                  checked={reason === "too_many_emails"}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-sm text-gray-700">I receive too many emails</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="not_relevant"
                  checked={reason === "not_relevant"}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-sm text-gray-700">Content isn’t relevant to me</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="did_not_sign_up"
                  checked={reason === "did_not_sign_up"}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-sm text-gray-700">I didn’t sign up</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value="other"
                  checked={reason === "other"}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-sm text-gray-700">Other</span>
              </label>
            </div>

            {reason === "other" && (
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
                placeholder="Tell us more (optional)"
              />
            )}
          </div>

          {msg && <div className="text-sm text-red-600">{msg}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg bg-[#2B5561] text-white font-semibold hover:bg-[#2B5561]/85 disabled:opacity-60"
          >
            {submitting ? "Processing…" : "Unsubscribe"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            We’ll only use your email to remove you from our newsletter list.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Unsubscribe;