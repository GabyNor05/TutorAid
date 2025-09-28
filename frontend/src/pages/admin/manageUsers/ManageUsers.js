import react, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./manageUsers.css";
import ManageUserCard from './ManageUserCard';

function ManageUsers() {
  const [users, setUsers] = useState([]);
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
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="page-background">
      <div className="manage-users-grid">
        {users.map((user) => (
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
