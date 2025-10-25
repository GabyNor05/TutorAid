import React from "react";
import "./studentFileView.css";

function StudentFileViewCard({ student }) {
  return (
    <div className="student-file-view-card">
      <div className="student-file-view-card-content flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white/95 rounded-xl shadow p-4">
        <div className="student-file-view-card-image shrink-0 self-center sm:self-start">
          <img
            src={student.image}
            alt={student.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border"
          />
        </div>
        <div className="student-file-view-card-info flex-1 min-w-0">
          <div className="student-file-view-card-details space-y-1">
            <h3 className="text-xl font-semibold text-[#2B5561] truncate">{student.name}</h3>
            <p className="text-gray-700 break-words"><strong>Email: </strong>{student.email}</p>
            <p className="text-gray-700"><strong>School: </strong>{student.school}</p>
            <p className="text-gray-700"><strong>Grade: </strong>{student.grade}</p>
          </div>
          <div className="student-file-view-card-bottom-row mt-3">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm file-status-label ${student.status ? student.status.toLowerCase() : "pending"}`}>
              {student.status || "Pending"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentFileViewCard;
