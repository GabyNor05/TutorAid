import React, { useEffect, useMemo, useState } from "react";
import { api, endpoints } from "../../../api/client";

function UserFeedback() {
  // Submit form
  const [category, setCategory] = useState("feature");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");


  const userID = Number(localStorage.getItem("userID") || 0) || null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const payload = {
        userID,
        email: email || null,
        category,
        rating,
        comment,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      };
      await api.post(endpoints.feedback(), payload);
      setSubmitMsg("Thanks! Your feedback was submitted.");
      setComment("");
      setRating(5);
      setCategory("feature");
    } catch (err) {
      setSubmitMsg(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = useMemo(() => ({
    bug: "Bug",
    feature: "Feature Request",
    ux: "Usability / UX",
    content: "Content Quality",
    performance: "Performance",
    other: "Other",
  }), []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-[#2B5561] mb-4">User Feedback</h1>

      {/* Submit feedback */}
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300"
              required
            >
              {Object.entries(categories).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-gray-300"
              required
            >
              {[5,4,3,2,1].map(r => (
                <option key={r} value={r}>
                  {r} - {r===5?"Excellent":r===4?"Good":r===3?"Okay":r===2?"Poor":"Bad"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-3 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1">Feedback</label>
          <textarea
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-300"
            placeholder="What should we improve or keep?"
            required
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="h-11 px-5 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/85 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
        </div>

        {submitMsg && <div className="mt-3 text-sm text-gray-700">{submitMsg}</div>}
      </form>
    </div>
  );
}
export default UserFeedback;