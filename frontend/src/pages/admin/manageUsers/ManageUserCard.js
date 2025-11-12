import React from "react";
import "./manageUsers.css";

function ManageUsersCard({ user }) {
  
    return(
        <div className="user-file-card transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            <div className="user-file-card-image">
                <img src={user.image} alt={user.name} />
            </div>
            <div className="user-file-card-content">
                <div className="user-file-card-grid">
                    <div className="user-info">
                        <h3>{user.name}</h3>
                        <p>Role: {user.role}</p>
                    </div>
                    <div className="view-file-link">
                        <a href={`/admin/manageUsers/edit/${user.userID}`}>View File</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageUsersCard;
