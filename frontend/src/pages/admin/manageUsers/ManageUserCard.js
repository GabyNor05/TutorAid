import React from "react";
import "./manageUsers.css";

function ManageUsersCard({ user, onEdit, onDelete }) {
    return(
        <div className="user-file-card transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            <div className="user-file-card-image">
                <img src={user.image} alt={user.name} />
                {user.status && (
  <div className={`user-file-card-status-label ${user.status.toLowerCase()}`}>
    {user.status}
  </div>
)}
            </div>
            <div className="user-file-card-content">
                <div className="user-file-card-grid">
                    <div className="user-info">
                        <h3>{user.name}</h3>
                        <p>Role: {user.role}</p>
                    </div>
                    <div className="view-file-link">
                        <a href="/studentfileview">View File</a>
                    </div>
                </div>
                <div className="user-file-card-actions">
                    <button className="upload-file-btn">Upload File</button>
                    <button className="edit-btn" onClick={() => onEdit(user)}>Edit</button>
                    <button className="delete-btn" onClick={() => onDelete(user)}>Delete</button>
                </div>
            </div>
        </div>
    )
}

export default ManageUsersCard;
