/* I need the following:
    a card 230 x 295, the top part is an image, the bottom part is text
    the card has a box-shadow: 0 4px 10px 5px rgba(0, 0, 0, 0.25);
    the card has rounded corners 20px
    over the picture, in the bottom left corner, there is a label with the student Status (Active, Inactive, Pending)
    for text under the picture: Name below that grade. Accross from that, the button "View File"
    below that a button for "upload file"

*/

import React from "react";
import "./studentFiles.css";

function StudentFileCard({ image, name, grade, status = "Pending" }) {
    return (
        <div className="student-file-card transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
            <div className="card-image">
                <img src={image} alt={name} />
                <div className={`status-label ${status ? status.toLowerCase() : "pending"}`}>
                    {status || "Pending"}
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