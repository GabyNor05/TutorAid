import React from "react";
import "./css/userprofile.css";

function UserCard({image, name, email, bio, subjects, availability, address, role }) {
    
    return (
        <>
            <div className = "userCard">
                {role === "tutor" && (
                    <>
                        <div style={{width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#E0E0E0"}}>
                            <img src={image} alt="Profile" style={{width: "100%", height: "100%", borderRadius: "50%"}} />
                        </div>
                        <div className="userCard-content">
                            <h3>{name}</h3>
                            <p><strong>Email: </strong>{email}</p>
                            <p><strong>Bio: </strong>{bio}</p>
                            <p><strong>Subjects: </strong>{subjects}</p>
                            <p><strong>Availability: </strong>{availability}</p>
                        </div>
                    </>
                )}
                {role === "student" && (
                    <>
                        <div style={{width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#E0E0E0"}}>
                            <img src={image} alt="Profile" style={{width: "100%", height: "100%", borderRadius: "50%"}} />
                        </div>
                        <div className="userCard-content">
                            <h3>{name}</h3>
                            <p><strong>Email: </strong>{email}</p>
                            <p><strong>Address: </strong>{address}</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default UserCard;