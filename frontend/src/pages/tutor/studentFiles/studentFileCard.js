import React, { useRef } from "react";
import "./studentFiles.css";

function StudentFileCard({ student }) {
    const fileInputRef = useRef();

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("studentID", student.studentID);

        try {
            const res = await fetch("http://localhost:5000/api/progressnotes/upload", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                alert("File uploaded successfully!");
            } else {
                alert("Failed to upload file.");
            }
        } catch (err) {
            alert("Error uploading file.");
        }
    };

    return (
        <div className="student-file-card transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            <div className="card-image">
                <img src={student.image} alt={student.name} />
                {student.status && (
                    <div className={`user-file-card-status-label ${student.status.toLowerCase()}`}>
                        {student.status}
                    </div>
                )}
            </div>
            <div className="card-content">
                <div className="student-card-grid">
                    <div>
                        <h3>{student.name}</h3>
                        <p>Grade {student.grade}</p>
                    </div>
                    <div className="view-file-link">
                        <a href={`/tutor/studentFileView/${student.userID}`}>View File</a>
                    </div>
                </div>
                <div className="card-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <button className="upload-file-btn" onClick={handleUploadClick}>
                        Upload File
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentFileCard;