import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/userprofile.css";
import UserCard from "./UserCards";

function UserProfile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Replace with actual user ID (e.g., from auth or localStorage)
        const userId = localStorage.getItem("userID");
        axios.get(`http://localhost:5000/api/users/${userId}`)
            .then(res => setUser(res.data))
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
        </div>
    );
}

export default UserProfile;