import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./manageUsers.css";
import ManageUserCard from './ManageUserCard';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Add searchTerm state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    navigate(`/admin/manageUsers/edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter((user) => user.userID !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Filter users by name
  const filteredUsers = users.filter(user =>
    user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-background">
      <div className="search-bar rounded-lg border border-[#ffe998] p-2 w-1/4 inside-shadow flex items-center cursor-pointer m-auto mb-10">
        <MagnifyingGlassIcon className='inline text-[#ffe998]' size={28} weight="light" />
        <input
          className='w-full h-full pl-2 bg-transparent text-lg outline-none text-[#fff]'
          placeholder='Search by name'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="manage-users-grid">
        {filteredUsers.map((user) => (
          <ManageUserCard
            key={user.userID}
            user={user}
            onEdit={() => handleEdit(user.userID)}
            onDelete={() => handleDelete(user.userID)}
          />
        ))}
      </div>
    </div>
  );
}

export default ManageUsers;
