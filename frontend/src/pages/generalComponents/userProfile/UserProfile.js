import React from "react";

function UserProfile() {
    const role = "tutor";
    return(
        <div className="page-background">
            <div className="pt-2 text-center">
                <h1 className="page-title">User Profile</h1>  
            </div>
            {role === "tutor" && (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", paddingBottom: "30px"}}>
                    <div style={{width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#E0E0E0"}}>
                        <img src="https://via.placeholder.com/150" alt="Profile" style={{width: "100%", height: "100%", borderRadius: "50%"}} />
                    </div>
                    <h1>Dr Lauren Lewis</h1>
                    <p>Email: laurenl@ashinc.fae</p>
                    <p>Bio: Experienced tutor with a passion for teaching.</p>
                    <p>Subjects: Math, Science, English</p>
                    <p>Availability: Mon-Fri, 9am-5pm</p>
                </div>)}
            {role === "student" && (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", paddingBottom: "30px"}}>
                    <div style={{width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#E0E0E0"}}>
                        <img src="https://via.placeholder.com/150" alt="Profile" style={{width: "100%", height: "100%", borderRadius: "50%"}} />
                    </div>
                    <h1>Bo Fin Arvin</h1>
                    <p>Email: isabeau@unaligned.fae</p>
                    <p>Address: 321 Corner of Fae and Lewis</p>
                </div>)}
            
        </div>
    )

}

export default UserProfile;