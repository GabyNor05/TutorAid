import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./studentFileView.css";
import StudentFileViewCard from "./StudentFileViewCard";
import ProgressNotes from "./progressNotes/ProgressNotes";
import { api, endpoints } from "../../../api/client";

function StudentFileView() {
    const { userID } = useParams();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const data = await api.get(endpoints.studentByUser(userID));
                setStudent(Array.isArray(data) ? data[0] : data);
            } catch (error) {
                console.error("Error fetching student:", error);
            }
        };
        if (userID) fetchStudent();
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