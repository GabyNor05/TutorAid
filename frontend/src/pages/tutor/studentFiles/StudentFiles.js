import React, { useEffect, useState } from "react";
import "./studentFiles.css";
import StudentFileCard from "./studentFileCard";
import { MagnifyingGlassIcon, FunnelSimple } from "@phosphor-icons/react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentFiles() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [sortOrder, setSortOrder] = useState(""); // "asc" or "desc"
    const [showSortMenu, setShowSortMenu] = useState(false);
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

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/students/statuses");
                setStatuses(response.data); // Should be an array of status strings
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };
        fetchStatuses();
    }, []);

    // Filter students by search term (case-insensitive)
    let filteredStudents = students.filter(student =>
        (student.name || student.studentName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (selectedStatus) {
        filteredStudents = filteredStudents.filter(student => student.status === selectedStatus);
    }

    if (sortOrder === "asc") {
        filteredStudents = [...filteredStudents].sort((a, b) =>
            (a.name || a.studentName || "").localeCompare(b.name || b.studentName || "")
        );
    } else if (sortOrder === "desc") {
        filteredStudents = [...filteredStudents].sort((a, b) =>
            (b.name || b.studentName || "").localeCompare(a.name || a.studentName || "")
        );
    }

    return (
        <div className="blue-page-background">
            <div className="pt-2 text-center">
                <h1 className="blue-page-title">Student Files</h1>  
            </div>
            <div className="">
                <div className="search-bar rounded-lg border border-[#ffe998] p-2 w-1/4 inside-shadow flex items-center cursor-pointer m-auto mb-10">
                    <MagnifyingGlassIcon className='inline text-[#ffe998]' size={28} weight="light" />
                    <input
                        className='w-full h-full pl-2 bg-transparent text-lg outline-none text-[#fff]'
                        placeholder='Search by name'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-section text-center mb-6 flex justify-center items-center gap-4">
                    <select
                        className="rounded-lg border border-[#ffe998] p-2 bg-transparent text-gray-200"
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(status => (
                            <option  className = "text-black" key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <div className="relative">
                        <button
                            className="p-2 rounded-full border border-[#ffe998] bg-transparent"
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            aria-label="Sort"
                        >
                            <FunnelSimple size={24} className="text-[#ffe998]" />
                        </button>
                        {showSortMenu && (
                            <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-10">
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => { setSortOrder("asc"); setShowSortMenu(false); }}
                                >
                                    Name Ascending
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => { setSortOrder("desc"); setShowSortMenu(false); }}
                                >
                                    Name Descending
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="student-files-container">
                <div className="student-files-grid">
                    {filteredStudents.map((student) => (
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