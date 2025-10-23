import React, { useEffect, useState } from "react";
import "./progressNotes.css";
import PdfCard from "./PdfCard";
import { api, endpoints } from "../../../../api/client"; // ADD

function ProgressNotes({ studentID }) {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await api.get(endpoints.progressNotesByStudent(studentID)); // FIX
                setNotes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching progress notes:", err);
            }
        };
        if (studentID) fetchNotes();
    }, [studentID]);

    return (
        <div className="blue-page-background">
            <div className="pt-2 text-center">
                <h1 className="blue-page-title">Progress Notes</h1>  
            </div>
            <div className="heading-row">
                <div>Name</div>
                <div>Date</div>
                <div>Size</div>
                <div>Actions</div>
                <div></div>
            </div>
            <div className="pdf-cards-container">
                {notes.map(note => (
                    <PdfCard
                        key={note.noteID}
                        title={note.file_name}
                        date={note.uploaded_at?.slice(0, 10)}
                        size={note.file_size ? `${(note.file_size / (1024 * 1024)).toFixed(2)} MB` : ""}
                        filePath={note.file_path}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProgressNotes;
