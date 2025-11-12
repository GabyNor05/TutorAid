import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./manageUsers.css";
import ManageUserCard from './ManageUserCard';
import { MagnifyingGlassIcon, FunnelSimple } from '@phosphor-icons/react';
import { api, endpoints } from '../../../api/client';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(""); // ADD
  const [sortOrder, setSortOrder] = useState("");       // ADD: "asc" | "desc" | ""
  const [showSortMenu, setShowSortMenu] = useState(false); // ADD
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get(endpoints.users());
        const list = Array.isArray(data) ? data : [];
        setUsers(list);
        // Build unique roles list (truthy only)
        const unique = Array.from(new Set(list.map(u => u.role).filter(Boolean)));
        setRoles(unique);
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
      await api.post(endpoints.usersRemove(), { userID: userId, adminPassword });
      setUsers(prev => prev.filter((user) => user.userID !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  const collator = useMemo(() => new Intl.Collator(undefined, { sensitivity: "base" }), []);
  const filteredUsers = useMemo(() => {
    let list = Array.isArray(users) ? [...users] : [];
    const q = String(searchTerm || "").toLowerCase();

    if (q) {
      list = list.filter(u => String(u.name || "").toLowerCase().includes(q));
    }
    if (selectedRole) {
      const want = String(selectedRole).toLowerCase();
      list = list.filter(u => String(u.role || "").toLowerCase() === want);
    }
    if (sortOrder === "asc") {
      list.sort((a, b) => collator.compare(a.name || "", b.name || ""));
    } else if (sortOrder === "desc") {
      list.sort((a, b) => collator.compare(b.name || "", a.name || ""));
    }
    return list;
  }, [users, searchTerm, selectedRole, sortOrder, collator]);

  return (
    <div className="page-background">
      <div className="search-bar rounded-lg border-2 border-cyan-800 p-2 w-1/4 inside-shadow flex items-center cursor-text m-auto mb-10">
        <MagnifyingGlassIcon className='inline text-cyan-800' size={28} weight="bold" />
        <input
          className='w-full h-full pl-2 bg-transparent text-lg outline-none text-[#000]'
          placeholder='Search by name'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-section text-center mb-6 flex flex-wrap justify-center items-center gap-3">
        <select
          className="w-48 rounded-lg border-2 border-cyan-800 px-3 py-2 bg-transparent text-black/70 "
          aria-label="Filter by Role"

          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option className="text-black" value="">All Roles</option>
          {roles.map(role => (
            <option className="text-black" key={role} value={role}>{role}</option>
          ))}
        </select>

        <div className="relative">
          <button
            className="p-2 rounded-full border-2 border-cyan-800 bg-transparent"
            onClick={() => setShowSortMenu(!showSortMenu)}
            aria-label="Sort"
            type="button"
          >
            <FunnelSimple size={22} className="text-cyan-800" weight='bold'/>
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
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setSortOrder(""); setShowSortMenu(false); }}
              >
                Clear Sort
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full flex flex-col items-center max-w-7xl px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
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
    </div>
  );
}

export default ManageUsers;
