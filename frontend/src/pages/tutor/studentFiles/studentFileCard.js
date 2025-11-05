import React, { useRef } from "react";
import "./studentFiles.css";
import { api, endpoints } from "../../../api/client";

function StudentFileCard({ student }) {
  const fileInputRef = useRef();

  // Tailwind status pill classes (mobile: bottom-left, desktop: top-left)
  const statusPillClasses = (status) => {
    const s = String(status || "").toLowerCase();
    let bg = "bg-gray-600/70";
    if (s.includes("active")) bg = "bg-green-600/60";
    else if (s.includes("inactive")) bg = "bg-amber-500/80";
    else if (s.includes("blocked") || s.includes("suspended")) bg = "bg-red-700/70";
    else if (s.includes("pending")) bg = "bg-amber-500/80";
    return `absolute bottom-2 left-2  px-2 py-0.5 rounded-[12px] text-[10px] sm:text-xs font-semibold text-white ${bg}`;
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentID", student.studentID);
    try {
      await api.post(endpoints.progressNotesUpload(), formData);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload file.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white w-full lg:w-60 overflow-hidden rounded-[14px] shadow transition hover:shadow-md hover:-translate-y-0.5
                    flex flex-col lg:h-[300px]">
      {/* Media */}
      <div className="relative w-full ">
        <img
          className="object-cover w-full h-[130px] sm:h-36 md:h-40 lg:h-[180px] bg-slate-200"
          src={student.image || ""}
          alt={student.name || "Student"}
        />
        {student.status && (
          <div className={statusPillClasses(student.status)} title={String(student.status)}>
            {student.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between px-4 py-1.5 sm:py-2 md:px-5 md:py-3 lg:px-6 lg:py-4">
        <div className="grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 items-center gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate text-sm sm:text-base md:text-lg">
              {student.name}
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500">
              Grade {student.grade}
            </p>
            <div className="flex flex-row justify-between lg:justify-end items-center gap-3">
                <div className="card-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
              />
              <button
                className="bg-[var(--Wall-Teal)] text-white rounded text-[10px] sm:text-xs md:text-sm h-8 px-3 sm:px-4 md:px-5"
                onClick={handleUploadClick}
              >
                Upload File
              </button>
            </div>
            <div className="view-file-link">
              <a
                className="text-xs sm:text-sm md:text-base"
                href={`/tutor/studentFileView/${student.userID}`}
              >
                View File
              </a>
            </div>
          </div>
            
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default StudentFileCard;