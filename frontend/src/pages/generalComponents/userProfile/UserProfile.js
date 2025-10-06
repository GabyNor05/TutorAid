import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/userprofile.css";
import UserCard from "./UserCards";
import PdfCard from "../../tutor/studentFileView/progressNotes/PdfCard";

function UserProfile() {
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        axios.get(`http://localhost:5000/api/users/${userId}`)
            .then(res => {
               
                setUser(res.data);
                if (res.data.role === "Student" && res.data.studentID) {
                    
                    axios.get(`http://localhost:5000/api/progressNotes/student/${res.data.studentID}/published`)
                        .then(res => {
                            
                            setNotes(res.data);
                        })
                        .catch(err => console.error("Failed to fetch notes:", err));
                }
            })
            .catch(err => console.error("Failed to fetch user:", err));
    }, []);

    const handleSave = async (updatedData) => {
        const userId = localStorage.getItem("userID");
        try {
            const res = await axios.put(`http://localhost:5000/api/users/${userId}`, updatedData);
            setUser(res.data); // Update local state with new data
        } catch (err) {
            console.error("Failed to update user:", err);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="page-background">
            <div className="pt-2 text-center">
                <h1 className="page-title">User Profile</h1>
            </div>
            <UserCard
                {...user}
                onSave={handleSave}
                onDelete={() => {/* your delete logic */}}
            />
            {user.role === "Student" && (
                <div>
                    <div className="blue-page-background mt-6 p-4">
                        <div className="mt-8 bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-cyan-800">Published Notes</h2>
                            <div className="space-y-4">
                                {notes.map(note => (
                                    <PdfCard
                                        key={note.noteID}
                                        title={note.file_name}
                                        date={note.uploaded_at?.slice(0, 10)}
                                        size={note.file_size}
                                        filePath={note.file_path}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;