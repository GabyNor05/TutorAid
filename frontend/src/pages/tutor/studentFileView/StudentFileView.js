import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./studentFileView.css";
import StudentFileViewCard from "./StudentFileViewCard";
import ProgressNotes from "./progressNotes/ProgressNotes";
import { api, endpoints } from "../../../api/client";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

function StudentFileView() {
    const { userID } = useParams();
    const [student, setStudent] = useState(null);
    const navigate = useNavigate();
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

    if (!student) return <div className="page-background px-4 py-6">Loading...</div>;

    return (
        <div className="page-background">
            <button
                    type="button"
                    style={{ position: 'fixed', left: 16, top: 80, zIndex: 2147483647 }}
                    className="px-3 py-1.5 bg-white text-[#2b5561] text-lg hover:border-white/70 border-2 rounded-lg flex flex-row items-center gap-2"
                    onClick={() => {
                      navigate(window.history.back());
                    }}
                  >
                    {/* ← */}  <CaretLeftIcon size={24} /> Back
                  </button>
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-6 space-y-4">
                <StudentFileViewCard student={student} />
                <ProgressNotes studentID={student.studentID} />
            </div>
        </div>
    );
}

export default StudentFileView;