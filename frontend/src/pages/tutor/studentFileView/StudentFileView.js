import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./studentFileView.css";
import StudentFileViewCard from "./StudentFileViewCard";
import ProgressNotes from "./progressNotes/ProgressNotes";

function StudentFileView() {
    const { userID } = useParams();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/students/by-user/${userID}`);
                const data = await response.json();
                setStudent(data);
            } catch (error) {
                console.error("Error fetching student:", error);
            }
        };
        fetchStudent();
    }, [userID]);

    if (!student) return <div>Loading...</div>;

    return (
        <div className="page-background">
            <div>
                <StudentFileViewCard student={student} />
            </div>
            <ProgressNotes studentID={student.studentID} />
        </div>
    );
}

export default StudentFileView;