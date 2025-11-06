import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./manageUsers.css";
import ManageUserCard from './ManageUserCard';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { api, endpoints } from '../../../api/client';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get(endpoints.users());
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert(error.message || 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    navigate(`/admin/manageUsers/edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    const adminPassword = window.prompt("Enter admin password to confirm deletion:");
    if (!adminPassword) return;
    try {
      await api.post(endpoints.usersRemove(), { userID: userId, adminPassword }); // CHANGE
      setUsers(prev => prev.filter((user) => user.userID !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
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
          />
        ))}
      </div>
    </div>
  );
}

export default ManageUsers;
