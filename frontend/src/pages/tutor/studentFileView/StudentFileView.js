import React from "react";
import "./studentFileView.css";
import StudentFileViewCard from "./StudentFileViewCard";
import ProgressNotes from "./progressNotes/ProgressNotes";

function StudentFileView() {
    return (
        <div className="page-background">
            <div >
                  <StudentFileViewCard 
                    student={{
                        image: "https://via.placeholder.com/150",
                        name: "John Doe",
                        email: "john.doe@example.com",
                        school: "Springfield High",
                        grade: "10",
                        status: "Active"
                    }}
                  />

            </div>
            <ProgressNotes />
        </div>
    );
}

export default StudentFileView;