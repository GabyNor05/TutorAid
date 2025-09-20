import React from "react";

function LessonCards({ image, name, date, time, address, subject, showStatus = true }) {
    return (
         <div className="lesson-cards" style={{display: "flex", alignItems: "center", }}>
            <div className="lesson-info" style={{ borderRadius: "8px", padding: "30px", margin: "0 auto", display: "grid", alignItems: "center", gridTemplateColumns: "1fr 2fr 1fr", gap: "20px", width: "1000px", backgroundColor: '#f9f9f9', height: "200px" }}>
                <div className="card-imageCol">
                    <div style={{height: "150px", width: "200px", backgroundColor: "#E0E0E0", borderRadius: "8px" }}>
                        <img style = {{}} src={image} alt={name} />
                    </div>  
                </div>
                <div className="card-contentCol" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "10px"}}>
                    <h3>{name}</h3>
                    <p>Date: {date}, Time: {time}</p>
                    <p>Address: {address}</p>
                </div>
                <div className="card-subjectCol" style={{display: "grid", gridTemplateRows: "1fr 2fr 1fr", justifyItems: "right", alignItems: "center"}}>
                    <div className="subject-badge" style={{background: "#F1B356", width: "65px", height: "30px", borderRadius: "10px", textAlign: "center"}}>{subject}</div>
                    <div></div>
                    {showStatus && (
                        <div className="card-status" style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                            <button className="accept" style={{color: "#3A9D23"}}>Accept</button>
                            <button className="decline" style={{color: "#B22222"}}>Decline</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonCards;