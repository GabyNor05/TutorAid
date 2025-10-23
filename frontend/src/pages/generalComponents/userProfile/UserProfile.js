import React, { useState, useEffect } from "react";
import "./css/userprofile.css";
import UserCard from "./UserCards";
import PdfCard from "../../tutor/studentFileView/progressNotes/PdfCard";
import { api, endpoints } from "../../../api/client";

function UserProfile() {
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        if (!userId) return;

        (async () => {
            try {
                const u = await api.get(endpoints.userById(userId));
                setUser(u);

                const studentID = u?.studentID;
                if (u?.role === "Student" && studentID) {
                    const published = await api.get(endpoints.progressNotesStudentPublished(studentID));
                    setNotes(Array.isArray(published) ? published : []);
                }
            } catch (err) {
                console.error("Failed to fetch user/profile data:", err);
            }
        })();
    }, []);

    const handleSave = async (updatedData) => {
        const userId = localStorage.getItem("userID");
        try {
            const updated = await api.put(endpoints.userById(userId), updatedData);
            setUser(updated);
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