import React, { useState } from "react";
import "./css/userprofile.css";
import UserCard from "./UserCards";


function UserProfile() {
    const [user, setUser] = useState({
        name: "Dr Lauren Lewis",
        email: "laurenl@ashinc.fae",
        bio: "Experienced tutor with a passion for teaching.",
        subjects: "Math, Science, English",
        availability: "Mon-Fri, 9am-5pm",
        address: "123 Main St",
        image: "https://via.placeholder.com/150",
        role: "tutor"
    });

    // For demonstration, you can change role to "student" to test student view
    const role = user.role;

    return(
        <div className="page-background">
            <div className="pt-2 text-center">
                <h1 className="page-title">User Profile</h1>  
            </div>
            <UserCard
                {...user}
                onSave={updatedData => setUser({ ...user, ...updatedData })}
                onDelete={() => {/* your delete logic */}}
            />
        </div>
    )

}

export default UserProfile;