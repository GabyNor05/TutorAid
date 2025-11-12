import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MessageCard from "./MessageCard";
import { api, endpoints } from "../../api/client";

function Inbox({ open, onClose, tabs, activeTab, setActiveTab, messages, visibleMessages }) {
  const [selected, setSelected] = useState(null);
  const [senderUser, setSenderUser] = useState(null);
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const userId = typeof window !== "undefined" ? localStorage.getItem("userID") : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!selected?.senderID) { setSenderUser(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const u = await api.get(endpoints.userById ? endpoints.userById(selected.senderID) : `/api/users/${selected.senderID}`);
        if (!cancelled) setSenderUser(u || null);
      } catch {
        if (!cancelled) setSenderUser(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selected]);

  const closeSelected = () => {
    setSelected(null);
    setReplying(false);
    setReplyBody("");
  };

  const handleMarkRead = async () => {
    if (!selected?.messageID) return;
    try {
      if (endpoints.messageMarkRead) {
        await api.patch(endpoints.messageMarkRead(selected.messageID)); // CHANGE: PATCH
      } else {
        await api.patch(`/api/messages/${selected.messageID}/read`);    // CHANGE: PATCH
      }
      closeSelected();
    } catch {
      closeSelected();
    }
  };

  const handleDelete = async () => {
    if (!selected?.messageID) return;
    try {
      if (endpoints.messageById) {
        await api.delete(endpoints.messageById(selected.messageID));
      } else {
        await api.delete(`/api/messages/${selected.messageID}`);
      }
      closeSelected();
    } catch {
      closeSelected();
    }
  };

  const handleSendReply = async () => {
    if (!selected || !replyBody.trim() || !userId) return;
    try {
      const payload = {
        type: "Private Message",
        subject: `Re: ${selected.subject || ""}`.trim(),
        body: replyBody.trim(),
        senderID: Number(userId),
        receiverID: Number(selected.senderID),
      };
      await api.post(endpoints.messages ? endpoints.messages() : "/api/messages", payload);
      closeSelected();
    } catch {
      // keep modal open on failure
    }
  };

  const resolveType = (msg) => {
    const t = String(msg?.type || "").toLowerCase().trim();
    if (t) return t;
    const s = String(msg?.subject || "").toLowerCase();
    if (s.includes("lesson request")) return "lesson request";
    if (s.includes("progress note")) return "progress note";
    if (s.includes("student request")) return "student request";
    return "";
  };

  const primaryDest = useMemo(() => {
    const t = resolveType(selected);
    if (t === "lesson request") return "/lessonrequests";
    if (t === "progress note") return "/userprofile";
    if (t === "student request") return "/studentrequests";
    return null;
  }, [selected]);

  const primaryLabel = useMemo(() => {
    if (!selected) return "Reply";
    const t = resolveType(selected);
    if (t === "lesson request") return "Open lesson request";
    if (t === "progress note") return "Open profile";
    if (t === "student request") return "Open student requests";
    return "Reply";
  }, [selected]);

  const handlePrimaryAction = () => {
    if (primaryDest) {
      closeSelected();
      onClose?.();
      navigate(primaryDest);
    } else {
      setReplying(true);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Centered container with safe padding on all screens */}
      <div className="relative z-[101] h-full w-full grid place-items-center p-4 sm:p-6">
        <div className="bg-white w-full max-w-5xl h-[85%] max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-[#2B5561]">
              Inbox <span className="text-gray-500">({messages.length})</span>
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              onClick={onClose}
              title="Close"
              aria-label="Close inbox"
            >
              &times;
            </button>
          </div>

          {/* Role-based tabs */}
          <div
            className="flex gap-2 px-3 sm:px-6 py-2 border-b bg-gray-50 overflow-x-auto md:flex-wrap"
            role="tablist"
            aria-label="Message filters"
          >
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm md:text-base font-semibold transition
                    ${active ? "bg-cyan-100 text-[#2B5561]" : "text-gray-600 hover:bg-gray-100"}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-2 py-2 sm:px-3">
            {visibleMessages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">No messages</div>
            ) : (
              visibleMessages.map((m) => (
                <MessageCard
                  key={m.messageID}
                  messageID={m.messageID}
                  senderID={m.senderID}
                  time={m.sentAt}
                  message={m.body}
                  unread={!m.isRead}
                  online={false}
                  subject={m.subject}
                  onOpen={() => setSelected(m)} // CHANGE: was openThread(m)
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Read/Reply modal */}
      {selected && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/40" onClick={closeSelected} aria-hidden="true" />
          <div className="relative z-[111] h-full w-full grid place-items-center p-4 sm:p-6">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2B5561] truncate" title={selected.subject || ""}>
                    {selected.subject || "Message"}
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    From: {senderUser?.name || `User #${selected.senderID}`} •{" "}
                    {selected.sentAt ? new Date(selected.sentAt).toLocaleString() : ""}
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700 text-3xl leading-none" onClick={closeSelected} aria-label="Close">
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <p className="text-gray-800 whitespace-pre-wrap break-words">{selected.body}</p>
              </div>

              <div className="px-4 sm:px-6 py-3 border-t flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {!selected.isRead && (
                    <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={handleMarkRead}>
                      Mark as read
                    </button>
                  )}
                  <button className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
                    Delete
                  </button>
                  <button className="px-4 py-2 rounded bg-[#2B5561] hover:bg-[#2B5561]/85 text-white" onClick={handlePrimaryAction}>
                    {primaryLabel}
                  </button>
                </div>

                {replying && !primaryDest && (
                  <div className="w-full sm:w-auto flex-1">
                    <textarea
                      rows={3}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 focus:outline-none text-black focus:ring-2 focus:ring-[#2B5561]"
                      placeholder={`Reply to ${senderUser?.name || "sender"}...`}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        className="px-4 py-2 rounded bg-[#2B5561] hover:bg-[#2B5561]/85 text-white disabled:opacity-50"
                        disabled={!replyBody.trim()}
                        onClick={handleSendReply}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inbox;