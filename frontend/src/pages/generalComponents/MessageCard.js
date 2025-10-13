import React, { useEffect, useState } from "react";
import axios from "axios";

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

function MessageCard({ senderID, time, message, unread, online, subject }) {
  const [sender, setSender] = useState({ name: "Unknown", image: "https://via.placeholder.com/40" });

  useEffect(() => {
    if (senderID) {
      axios.get(`http://localhost:5000/api/users/${senderID}`)
        .then(res => setSender({
          name: res.data.name,
          image: res.data.image || "https://via.placeholder.com/40"
        }))
        .catch(() => setSender({ name: "Unknown", image: "https://via.placeholder.com/40" }));
    }
  }, [senderID]);

  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-cyan-50 rounded-xl cursor-pointer transition">
      <div className="relative">
        <img
          src={sender.image}
          alt={sender.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
        />
        {online && (
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800 truncate">
            {subject}
            <span className="ml-2 text-xs text-gray-400 text-center justify-center">
              {getDateLabel(time)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm text-gray-600 truncate ${unread ? "font-bold" : ""}`}>
            {message}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-400">
          {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ""}
        </span>
        {unread && (
          <span className="ml-2 w-5 h-5 flex items-center justify-center bg-cyan-500 text-white text-xs rounded-full font-bold mr-auto">
            1
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageCard;