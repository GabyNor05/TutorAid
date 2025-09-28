
import React from "react";
import "./studentFiles.css";

function StudentFileCard({ image, name, grade, status = "Active" }) {
    return (
        <div className="student-file-card transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            <div className="card-image">
                <img src={image} alt={name} />
                <div className={`status-label ${status ? status.toLowerCase() : "active"}`}>
                    {status || "Active"}
                </div>
            </div>
            <div className="card-content">
                <div className = "student-card-grid">
                    <div>
                        <h3>{name}</h3>
                        <p>Grade {grade}</p>
                    </div>
                    <div className="view-file-link">
                        <a href="/studentfileview">View File</a>
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