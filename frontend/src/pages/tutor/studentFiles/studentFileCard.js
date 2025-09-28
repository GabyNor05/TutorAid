import React from "react";
import "./studentFiles.css";

function StudentFileCard({ student }) {
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
                    <button className="upload-file-btn">Upload File</button>
                </div>
            </div>
        </div>
    );
}

export default StudentFileCard;