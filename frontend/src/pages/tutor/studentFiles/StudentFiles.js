import React, { useEffect, useState, useMemo } from "react";
import "./studentFiles.css";
import StudentFileCard from "./studentFileCard";
import { MagnifyingGlassIcon, FunnelSimple } from "@phosphor-icons/react"; 
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../../../api/client"; 

function StudentFiles() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [sortOrder, setSortOrder] = useState(""); // "asc" or "desc"
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [limit, setLimit] = useState(8);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.get(endpoints.students());
                setStudents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const data = await api.get(endpoints.studentsStatuses());
                setStatuses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };
        fetchStatuses();
    }, []);

    // Reset pagination when filters/search change
    useEffect(() => { setLimit(8); }, [searchTerm, selectedStatus, sortOrder]);

    const normalize = (v) => String(v || "").toLowerCase();
    const collator = useMemo(() => new Intl.Collator(undefined, { sensitivity: "base" }), []);

    // Single source of truth: filtered + sorted list
    const filteredList = useMemo(() => {
        let list = Array.isArray(students) ? [...students] : [];

        // Search by name (supports both name and studentName fields)
        if (searchTerm) {
            const q = normalize(searchTerm);
            list = list.filter(s =>
                normalize(s.name || s.studentName || "").includes(q)
            );
        }

        // Status filter (case-insensitive exact match)
        if (selectedStatus) {
            const want = normalize(selectedStatus);
            list = list.filter(s => normalize(s.status) === want);
        }

        // Sort by name
        if (sortOrder === "asc") {
            list.sort((a, b) => collator.compare(a.name || a.studentName || "", b.name || b.studentName || ""));
        } else if (sortOrder === "desc") {
            list.sort((a, b) => collator.compare(b.name || b.studentName || "", a.name || a.studentName || ""));
        }

        return list;
    }, [students, searchTerm, selectedStatus, sortOrder, collator]);

    const visible = filteredList.slice(0, limit);

    return (
        <div className="blue-page-background">
            <div className="pt-2 text-center">
                <h1 className="blue-page-title">Student Files</h1>
            </div>

            {/* Controls */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="search-bar rounded-lg border border-[#ffe998] p-2 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 inside-shadow flex items-center cursor-text m-auto mb-6">
                    <MagnifyingGlassIcon className="inline text-[#ffe998]" size={24} weight="light" />
                    <input
                        className="w-full h-full pl-2 bg-transparent text-base sm:text-lg outline-none text-white placeholder-white/70"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-section text-center mb-6 flex flex-wrap justify-center items-center gap-3">
                    <select
                        className="rounded-lg border border-[#ffe998] px-3 py-2 bg-transparent text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffe998]"
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                    >
                        <option className="text-black" value="">All Statuses</option>
                        {statuses.map(status => (
                            <option className="text-black" key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    <div className="relative">
                        <button
                            className="p-2 rounded-full border border-[#ffe998] bg-transparent"
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            aria-label="Sort"
                            type="button"
                        >
                            <FunnelSimple size={22} className="text-[#ffe998]" />
                        </button>
                        {showSortMenu && (
                            <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-10">
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => { setSortOrder("asc"); setShowSortMenu(false); }}
                                >
                                    Name Ascending
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => { setSortOrder("desc"); setShowSortMenu(false); }}
                                >
                                    Name Descending
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive grid */}
            <div className="mx-auto w-full flex flex-col items-center max-w-7xl px-4 sm:px-6 pb-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visible.map((student) => (
                        <div key={student.studentID} className="min-w-0">
                            <StudentFileCard student={student} />
                        </div>
                    ))}
                </div>
                {visible.length === 0 && (
                    <div className="text-gray-200 mt-6">No students match your filters.</div>
                )}
                
            </div>
        </div>
    );
}

export default StudentFiles;