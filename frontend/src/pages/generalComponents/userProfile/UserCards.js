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

  const fileInputRef = useRef();

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onSave) {
      const data = new FormData();
      data.append("image", file);
      onSave(data, true); // true = isFormData (upload only)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(editData);
    setEditMode(false);
  };

  return (
    <div className="userCard w-full max-w-2xl mx-auto bg-white/95 rounded-xl shadow p-4 sm:p-6">
      {/* Image */}
      <div
        className="userCard-image relative w-32 h-32 sm:w-44 sm:h-44 mx-auto rounded-full overflow-hidden bg-gray-200 hover:bg-sky-700 cursor-pointer"
        onClick={handleImageClick}
        title="Click to upload a new profile image"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleImageClick(); }}
      >
        <img
          src={image}
          alt={name || "Profile"}
          className="w-full h-full object-cover"
        />
        {/* Hidden file input */}
        <input
          className="userCard-image-input"
          type="file"
          name="image"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <span
          className="userCard-image-edit-icon absolute bottom-2 right-2 bg-white text-gray-700 hover:bg-cyan-800 hover:text-white rounded-full p-1.5 sm:p-2 shadow"
        >
          <Plus size={28} weight="bold" />
        </span>
      </div>

      {/* Content */}
      <div className="userCard-content mt-4">
        {editMode ? (
          <form
            className="userCard-edit-form space-y-3"
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          >
            <input
              name="name"
              value={editData.name || ""}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
            />
            <input
              name="email"
              type="email"
              value={editData.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
            />

            {role === "tutor" && (
              <>
                <textarea
                  name="bio"
                  value={editData.bio || ""}
                  onChange={handleChange}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                />
                <input
                  name="subjects"
                  value={editData.subjects || ""}
                  onChange={handleChange}
                  placeholder="Subjects"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                />
                <textarea
                  name="availability"
                  value={editData.availability || ""}
                  onChange={handleChange}
                  placeholder="Availability"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                />
              </>
            )}

            {role === "student" && (
              <>
                <input
                  name="school"
                  value={editData.school || ""}
                  onChange={handleChange}
                  placeholder="School"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
                />
                <input
                  name="address"
                  value={editData.address || ""}
                  onChange={handleChange}
                  placeholder="Address"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
              />
              <input
                name="city"
                value={editData.city || ""}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
              />
              <input
                name="province"
                value={editData.province || ""}
                onChange={handleChange}
                placeholder="Province"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300"
              />
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button className="userCard-save-btn px-4 py-2 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/85" type="submit">
                Save
              </button>
              <button
                type="button"
                className="userCard-cancel-btn px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#2B5561] text-center sm:text-left break-words">
              {name}
            </h3>
            <p className="text-gray-800 break-words mt-1">
              <strong>Email: </strong>{email}
            </p>
            <p className="text-gray-800 break-words mt-1">
              <strong>Fun Fact: </strong>{funFact}
            </p>
            {role === "Tutor" && (
              <div className="space-y-1.5 mt-2">
                <p className="text-gray-800 break-words"><strong>Bio: </strong>{bio}</p>
                <p className="text-gray-800 break-words"><strong>Subjects: </strong>{subjects}</p>
                <p className="text-gray-800 break-words"><strong>Qualifications: </strong>{qualifications}</p>
                <p className="text-gray-800 break-words"><strong>Availability: </strong>{availability}</p>
              </div>
            )}

            {role === "Student" && (
              <>
                <p className="text-gray-800 break-words mt-2"><strong>School: </strong>{school}</p>
                <p className="text-gray-800 break-words mt-2"><strong>Address: </strong>{address}</p>
                <p className="text-gray-800 break-words mt-2"><strong>City: </strong>{city}</p>
                <p className="text-gray-800 break-words mt-2"><strong>Province: </strong>{province}</p>
              </>
            )}

            <div className="userCardButtons flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
              <span
                className="userCard-edit-btn inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
                onClick={() => setEditMode(true)}
              >
                <PencilSimple size={20} />
                Edit
              </span>

              {onDelete && (
                <span
                  className="userCard-delete-btn inline-flex items-center gap-2 px-4 py-2 rounded border border-red-300 text-[#a83236] font-semibold hover:bg-red-50 cursor-pointer"
                  onClick={onDelete}
                >
                  <Trash size={20} />
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