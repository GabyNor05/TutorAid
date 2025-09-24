import React, { useRef, useState } from "react";
import "./css/userprofile.css";
import { PencilSimple, Trash, Plus } from "@phosphor-icons/react";

function UserCard({
  image,
  name,
  email,
  bio,
  subjects,
  qualifications,
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
    qualifications,
    availability,
    address
  });

  // Ref for hidden file input
  const fileInputRef = useRef();

  // Handle image click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and upload immediately
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && onSave) {
      // Create FormData for image only
      const data = new FormData();
      data.append("image", file);
      onSave(data, true); // true = isFormData
    }
  };

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
      <div className="userCard-image bg-gray-200 hover:bg-sky-700"
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          margin: "0 auto",
          cursor: "pointer",
          position: "relative"
        }}
        onClick={handleImageClick}
        title="Click to upload a new profile image"
      >
        <img
          src={image}
          alt={name || "Profile"}
          style={{ width: "100%", height: "100%", borderRadius: "50%" }}
        />
        {/* Hidden file input */}
        <input className="userCard-image-input hover:bg-sky-700"
          type="file"
          name="image"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <span className="userCard-image-edit-icon bg-white hover:bg-cyan-800 hover:text-white"
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            
            borderRadius: "50%",
            padding: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "14px"
          }}
        >
          <Plus size={32} weight="bold"/>
        </span>
      </div>
      <div className="userCard-content">
        {editMode ? (
          <form className="userCard-edit-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <input name="name" value={editData.name} onChange={handleChange} placeholder="Name" />
            <input name="email" value={editData.email} onChange={handleChange} placeholder="Email" />
            {role === "tutor" && (
              <>
                <input name="bio" value={editData.bio} onChange={handleChange} placeholder="Bio" />
                <input name="subjects" value={editData.subjects} onChange={handleChange} placeholder="Subjects" />
                <input name="availability" value={editData.availability} onChange={handleChange} placeholder="Availability" />
              </>
            )}
            {role === "student" && (
              <input name="address" value={editData.address} onChange={handleChange} placeholder="Address" />
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button className="userCard-save-btn" type="submit">Save</button>
              <button className="userCard-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h3>{name}</h3>
            <p><strong>Email: </strong>{email}</p>
            {role === "Tutor" && (
              <>
                <p><strong>Bio: </strong>{bio}</p>
                <p><strong>Subjects: </strong>{subjects}</p>
                <p><strong>Qualifications: </strong>{qualifications}</p>
                <p><strong>Availability: </strong>{availability}</p>
              </>
            )}
            {role === "Student" && (
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