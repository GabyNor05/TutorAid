/* I want a detailed view of the user with ID: {userID} */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./manageUsers.css";

function UserFileView() {
    const { userID } = useParams();
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removePassword, setRemovePassword] = useState("");
    const [removeMessage, setRemoveMessage] = useState("");
    const [statuses] = useState(["Active", "Inactive", "Blocked"]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${userID}`);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, [userID]);

    const handleStatusChange = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/users/change-status", {
                studentID: user.studentID, // Only for students
                newStatus,
                adminPassword
            });
            if (res.data.success) {
                setUser(prev => ({ ...prev, status: newStatus }));
                setStatusMessage("Status updated successfully!");
                setShowModal(false);
                setTimeout(() => setStatusMessage(""), 3000);
            } else {
                setStatusMessage(res.data.message || "Failed to update status.");
            }
        } catch (err) {
            setStatusMessage("Error updating status.");
        }
        setAdminPassword("");
        setNewStatus("");
    };

    const handleRemoveUser = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/users/remove-user", {
                userID,
                adminPassword: removePassword
            });
            if (res.data.success) {
                setRemoveMessage("User removed successfully!");
                setTimeout(() => {
                    setShowRemoveModal(false);
                    window.history.back();
                }, 1500);
            } else {
                setRemoveMessage(res.data.message || "Failed to remove user.");
            }
        } catch (err) {
            setRemoveMessage("Error removing user.");
        }
        setRemovePassword("");
    };

    if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className="w-28 h-28 rounded-lg object-cover mb-4 border-2 "
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-lg mb-4 bg-slate-300 flex items-center justify-center text-gray-600 text-xl">
                            No Image
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                    <p className="text-gray-500">User ID: {user.userID}</p>
                    <p className="text-gray-500">Role: {user.role}</p>
                </div>
                <div className="space-y-2">
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                    {user.role === "Tutor" && (
                        <>
                            <p><span className="font-semibold">Bio:</span> {user.bio}</p>
                            <p><span className="font-semibold">Subjects:</span> {user.subjects}</p>
                            <p><span className="font-semibold">Qualifications:</span> {user.qualifications}</p>
                            <p><span className="font-semibold">Availability:</span> {user.availability}</p>
                        </>
                    )}
                    {user.role === "Student" && (
                        <>
                            <p><span className="font-semibold">Grade:</span> {user.grade}</p>
                            <p><span className="font-semibold">School:</span> {user.school}</p>
                            <p><span className="font-semibold">City:</span> {user.city}</p>
                            <p><span className="font-semibold">Province:</span> {user.province}</p>
                            <p><span className="font-semibold">Address:</span> {user.address}</p>
                            <p><span className="font-semibold">Status:</span> {user.status}</p>
                        </>
                    )}
                    {user.role === "Admin" && (
                        <>
                            <p><span className="font-semibold">Admin Level:</span> {user.adminLevel}</p>
                            {/* Add more admin-specific fields if needed */}
                        </>
                    )}
                </div>
                <button
                    className="mt-8 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => window.history.back()}
                >
                    Back to Manage Users
                </button>
                {/* Only show status change for students */}
                {user.role === "Student" && (
                    <button
                        className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        onClick={() => setShowModal(true)}
                    >
                        Change User Status
                    </button>
                )}
                <button
                    className="mt-4 w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    onClick={() => setShowRemoveModal(true)}
                >
                    Remove User
                </button>
                {/* Status Message */}
                {statusMessage && showModal && (
                    <div className="mt-4 text-center text-sm text-green-600">{statusMessage}</div>
                )}
                {/* Change Status Modal */}
                {showModal && user.role === "Student" && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <form
                            className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col gap-4"
                            onSubmit={e => {
                                e.preventDefault();
                                handleStatusChange();
                            }}
                        >
                            <h3 className="text-lg font-semibold mb-2">Change Status</h3>
                            <select
                                value={newStatus}
                                onChange={e => setNewStatus(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            >
                                <option value="">Select Status</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <input
                                type="password"
                                placeholder="Admin Password"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            />
                            {statusMessage && (
                                <div className="text-center text-sm text-red-600">{statusMessage}</div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                    onClick={() => {
                                        setShowModal(false);
                                        setStatusMessage("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {/* Remove User Modal */}
                {showRemoveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <form
                            className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col gap-4"
                            onSubmit={e => {
                                e.preventDefault();
                                handleRemoveUser();
                            }}
                        >
                            <h3 className="text-lg font-semibold mb-2 text-red-700">Confirm Remove User</h3>
                            <p className="text-sm mb-2">Enter admin password to confirm removal.</p>
                            <input
                                type="password"
                                placeholder="Admin Password"
                                value={removePassword}
                                onChange={e => setRemovePassword(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            />
                            {removeMessage && (
                                <div className="text-center text-sm text-red-600">{removeMessage}</div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Remove
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                    onClick={() => {
                                        setShowRemoveModal(false);
                                        setRemoveMessage("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserFileView;
