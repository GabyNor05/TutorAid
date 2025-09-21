import React from "react";
import "./css/userprofile.css";
import UserCard from "./UserCards";


function UserProfile() {
    const role = "tutor";
    return(
        <div className="page-background">
            <div className="pt-2 text-center">
                <h1 className="page-title">User Profile</h1>  
            </div>
            {role === "tutor" && (
                <><UserCard name = "Dr Lauren Lewis" email = "laurenl@ashinc.fae" bio = "Experienced tutor with a passion for teaching." subjects = "Math, Science, English" availability="Mon-Fri, 9am-5pm" role = "tutor" /></>
                )}
            {role === "student" && (
                <><UserCard name = "Bo Fin Arvin" email = "isabeau@unaligned.fae" address="321 Corner of Fae and Lewis" role = "student" /></>
                )}
            
        </div>
    )

}

export default UserProfile;