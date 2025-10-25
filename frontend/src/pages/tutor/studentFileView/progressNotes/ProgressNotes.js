import React, { useEffect, useState } from "react";
import "./progressNotes.css";
import PdfCard from "./PdfCard";
import { api, endpoints } from "../../../../api/client"; // ADD

function ProgressNotes({ studentID }) {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await api.get(endpoints.progressNotesByStudent(studentID));
                setNotes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching progress notes:", err);
            }
        };
        if (studentID) fetchNotes();
    }, [studentID]);

    return (
        <div className="blue-page-background rounded-xl">
            <div className="pt-2 text-center px-4 sm:px-6">
                <h1 className="blue-page-title">Progress Notes</h1>
            </div>

            {/* Header: hidden on mobile */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 sm:px-6 mt-2 text-white/90 text-sm">
                <div className="col-span-6 md:col-span-6">Name</div>
                <div className="col-span-3 md:col-span-3">Date</div>
                <div className="col-span-3 md:col-span-3">Size</div>
            </div>

            <div className="px-4 sm:px-6 pb-4 space-y-3">
                {notes.map(note => (
                    <PdfCard
                        key={note.noteID}
                        title={note.file_name}
                        date={note.uploaded_at?.slice(0, 10)}
                        size={note.file_size} // pass raw size in bytes
                        filePath={note.file_path}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProgressNotes;
