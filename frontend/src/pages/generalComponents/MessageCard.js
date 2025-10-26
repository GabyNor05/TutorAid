import React, { useEffect, useState } from "react";
import { api, endpoints } from "../../api/client";

function getDateLabel(dateString) {
  if (!dateString) return "";
  const msgDate = new Date(dateString);
  const now = new Date();
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((nowDay - msgDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === 2) return "2 days ago";
  return msgDate.toLocaleDateString();
}

function MessageCard({ senderID, time, message, unread, online, subject, onOpen }) {
  const [sender, setSender] = useState({ name: "Unknown", image: "https://via.placeholder.com/40" });

  useEffect(() => {
    let ignore = false;
    async function loadSender() {
      if (!senderID) return;
      try {
        const res = await api.get(endpoints.userById(senderID));
        if (!ignore) {
          setSender({
            name: res?.name || "Unknown",
            image: res?.image || "https://via.placeholder.com/40",
          });
        }
      } catch {
        if (!ignore) setSender({ name: "Unknown", image: "https://via.placeholder.com/40" });
      }
    }
    loadSender();
    return () => { ignore = true; };
  }, [senderID]);

  const formattedTime = time
    ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  const dateLabel = getDateLabel(time);

  return (
    <div
      className="grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4 px-3 py-2 sm:px-4 sm:py-3 hover:bg-cyan-50 rounded-xl cursor-pointer transition"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen && onOpen(); } }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={sender.image}
          alt={sender.name}
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow"
        />
        {online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-400 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 truncate" title={subject || ""}>
            {subject}
          </span>
          {/* Mobile meta */}
          <div className="sm:hidden mt-0.5 text-xs text-gray-400 flex items-center gap-1">
            <span>{dateLabel}</span>
            {formattedTime && (
              <>
                <span className="mx-1">•</span>
                <span>{formattedTime}</span>
              </>
            )}
            {unread && (
              <span className="ml-2 w-5 h-5 flex items-center justify-center bg-[#2B5561] text-white text-xs rounded-full font-bold">
                1
              </span>
            )}
          </div>
        </div>

        {/* Preview (ellipsis) */}
        <div className="mt-0.5 sm:mt-1">
          <p
            className={`text-sm text-gray-600 ${unread ? "font-semibold" : ""} truncate`}
            title={message || ""}
          >
            {message}
          </p>
        </div>
      </div>

      {/* Right meta (sm+) */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-xs text-gray-400">
        <span className="whitespace-nowrap">{dateLabel}</span>
        {formattedTime && <span className="whitespace-nowrap">{formattedTime}</span>}
        {unread && (
          <span className="mt-1 w-5 h-5 flex items-center justify-center bg-[#2B5561] text-white text-xs rounded-full font-bold">
            1
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageCard;