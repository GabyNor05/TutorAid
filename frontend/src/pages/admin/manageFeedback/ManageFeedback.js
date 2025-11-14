import React, { useEffect, useMemo, useState } from "react";
import { api, endpoints } from "../../../api/client";
import { useNavigate } from "react-router-dom";
import { CaretLeftIcon } from "@phosphor-icons/react";

function ManageFeedback() {
  const navigate = useNavigate();

  // Admin list
  const [statusFilter, setStatusFilter] = useState("new");
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const userID = Number(localStorage.getItem("userID") || 0) || null;

  const loadFeedback = async () => {
    setLoadingList(true);
    try {
      const q = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : "";
      const data = await api.get(endpoints.feedbackList(q));
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err.message || "Failed to fetch feedback");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadFeedback(); }, [statusFilter]);


  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(endpoints.feedbackStatus(id), { status }); // use put if patch unavailable
      setItems(prev => prev.map(it => it.feedbackID === id ? { ...it, status } : it));
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
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
    <div className="page-background p-48">
      <button
              type="button"
              style={{ position: 'fixed', left: 16, top: 80, zIndex: 2147483647 }}
              className="px-3 py-1.5 bg-[#2B5561] text-white text-lg hover:border-[#2B5561]/70 border-2 rounded-lg flex flex-row items-center gap-2"
              onClick={() => {
                if (localStorage.getItem('selectedTutorID')) localStorage.removeItem('selectedTutorID');
                navigate(-1);
              }}
            >
              {/* ← */}  <CaretLeftIcon size={24} /> Back
            </button>
      <div className="bg-white rounded-xl shadow p-12">
        <div className="flex items-center justify-between mb-3">
          <h1 className="page-title">User Feedback</h1>
          <select
            value={statusFilter}
            onChange={(e)=>setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-transparent"
          >
            <option value="new">New</option>
            <option value="">All</option>
            <option value="reviewed">Reviewed</option>
            <option value="actioned">Actioned</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {loadingList ? (
          <div className="text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No feedback found.</div>
        ) : (
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.feedbackID} className="border rounded-lg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-gray-500">
                    #{it.feedbackID} • {new Date(it.created_at).toLocaleString()}
                    {it.userName ? ` • ${it.userName}` : ""}
                    {it.email ? ` • ${it.email}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded-full px-2 py-0.5 bg-slate-100">{it.category}</span>
                    <span className="text-xs rounded-full px-2 py-0.5 bg-amber-100">{it.rating}★</span>
                    <select
                      className="h-8 px-2 rounded border border-gray-300 text-sm bg-transparent"
                      value={it.status}
                      onChange={(e)=>updateStatus(it.feedbackID, e.target.value)}
                      disabled={updatingId === it.feedbackID}
                    >
                      <option value="new">new</option>
                      <option value="reviewed">reviewed</option>
                      <option value="actioned">actioned</option>
                      <option value="dismissed">dismissed</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{it.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default ManageFeedback;