/* I want a detailed view of the user with ID: {userID} */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./manageUsers.css";

function UserFileView() {
    const { userID } = useParams();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // Fetch student details using userID
                const response = await axios.get(`http://localhost:5000/api/students/by-user/${userID}`);
                setStudent(response.data);
            } catch (error) {
                console.error("Error fetching student:", error);
            }
        };

        fetchStudent();
    }, [userID]);

    if (!student) return <div>Loading...</div>;

    return (
        <div className="user-file-view">
            <h2>Student Details</h2>
            <p><strong>Student ID:</strong> {student.studentID}</p>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Status:</strong> {student.status}</p>
            <p><strong>Grade:</strong> {student.grade}</p>
            <p><strong>School:</strong> {student.school}</p>
            <p><strong>City:</strong> {student.city}</p>
            <p><strong>Province:</strong> {student.province}</p>
            {student.image && (
                <div>
                    <strong>Profile Image:</strong>
                    <img src={student.image} alt={student.name} style={{ width: "120px", borderRadius: "8px" }} />
                </div>
            )}
            {/* Add more student fields as needed */}
        </div>
    );
}

export default UserFileView;
