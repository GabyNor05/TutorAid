import React, { useState } from "react";
import "./css/userprofile.css";
import { PencilSimple, Trash } from "@phosphor-icons/react";

function UserCard({
  image,
  name,
  email,
  bio,
  subjects,
  availability,
  address,
  role,
  onSave,
  onDelete
}) {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    image,
    name,
    email,
    bio,
    subjects,
    availability,
    address
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(editData);
    setEditMode(false);
  };

  return (
    <div className="userCard">
      <div style={{ width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#E0E0E0", margin: "0 auto" }}>
        <img src={image} alt={name || "Profile"} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
      </div>
      <div className="userCard-content">
        {editMode ? (
          <form className="userCard-edit-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <input label = "Name" name="name" value={editData.name} onChange={handleChange} placeholder="Name" />
            <input label = "" name="email" value={editData.email} onChange={handleChange} placeholder="Email" />
            {role === "tutor" && (
              <>
                <input label = "" name="bio" value={editData.bio} onChange={handleChange} placeholder="Bio" />
                <input label = "" name="subjects" value={editData.subjects} onChange={handleChange} placeholder="Subjects" />
                <input label = "" name="availability" value={editData.availability} onChange={handleChange} placeholder="Availability" />
              </>
            )}
            {role === "student" && (
              <input name="address" value={editData.address} onChange={handleChange} placeholder="Address" />
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button className="userCard-save-btn" type="submit">Save</button>
              <button  className="userCard-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h3>{name}</h3>
            <p><strong>Email: </strong>{email}</p>
            {role === "tutor" && (
              <>
                <p><strong>Bio: </strong>{bio}</p>
                <p><strong>Subjects: </strong>{subjects}</p>
                <p><strong>Availability: </strong>{availability}</p>
              </>
            )}
            {role === "student" && (
              <p><strong>Address: </strong>{address}</p>
            )}
            <div className = "userCardButtons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span className="userCard-edit-btn" style={{ display: 'flex', gap: '8px' }}  onClick={() => setEditMode(true)}>
                <PencilSimple size={24} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Edit
              </span>
              {onDelete && (
                <span className="userCard-delete-btn" style={{display: 'flex', gap: '8px', color:'#a83236', fontWeight: 'bold', marginLeft: 10 }} onClick={onDelete}>
                  <Trash size={24} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Delete
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserCard;