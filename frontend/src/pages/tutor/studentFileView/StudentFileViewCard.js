import React from "react";
import "./studentFileView.css";

function StudentFileViewCard({ student }) {
  return (
    <div className="student-file-view-card">
        <div className="student-file-view-card-content">
            <div className="student-file-view-card-image">
                <img src={student.image} alt={student.name} />
            </div>
            <div className="student-file-view-card-info">
                <div className="student-file-view-card-details">
                    <h3>{student.name}</h3>
                    <p><strong>Email: </strong>{student.email}</p>
                    <p><strong>School: </strong>{student.school}</p>
                    <p><strong>Grade: </strong>{student.grade}</p>
                    
                </div>
                <div className="student-file-view-card-bottom-row">
                        
                        <div className={`file-status-label ${student.status ? student.status.toLowerCase() : "pending"}`}>
                            {student.status || "Pending"}
                        </div>
                    </div>
                </div>
        </div>
    </div>
  );
}

export default StudentFileViewCard;
