import React, { useEffect, useState } from "react";
import "./studentFiles.css";
import StudentFileCard from "./studentFileCard";
import { MagnifyingGlassIcon } from "@phosphor-icons/react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentFiles() {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/students");
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div className="blue-page-background">
            <div className="pt-2 text-center">
                <h1 className="blue-page-title">Student Files</h1>  
            </div>
            <div className="search-bar rounded-lg border border-[#ffe998] p-2 w-1/4 inside-shadow flex items-center cursor-pointer m-auto mb-10">
                <MagnifyingGlassIcon className='inline text-[#ffe998]' size={28} weight="light" />
                <input className='w-full h-full pl-2 bg-transparent text-lg outline-none text-[#fff]' placeholder='Search by name' />
            </div>
            <div className="student-files-container">
                <div className="student-files-grid">
                    {students.map((student) => (
                        <StudentFileCard
                            key={student.studentID}
                            student={student}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StudentFiles;