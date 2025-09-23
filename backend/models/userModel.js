const pool = require('../config/db');

const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT * FROM Users');
    return rows;
};

const getUserById = async (userID) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE userID = ?', [userID]);
    return rows[0];
};

const createUser = async (user) => {
    // Insert into Users table
    const [result] = await pool.query(
        'INSERT INTO Users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [user.image, user.name, user.email, user.password, user.role]
    );
    const userID = result.insertId;

    // Insert into role-specific table
    if (user.role === 'Tutor') {
        await pool.query(
            'INSERT INTO Tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
            [userID, user.bio || '', user.subjects || '', user.qualifications || '', user.availability || '']
        );
    } else if (user.role === 'Student') {
        await pool.query(
            'INSERT INTO Students (userID, grade, school, address, status) VALUES (?, ?, ?, ?, ?)',
            [userID, user.grade || '', user.school || '', user.address || '', user.status || 'Active']
        );
    } else if (user.role === 'Admin') {
        await pool.query(
            'INSERT INTO Admins (userID) VALUES (?)',
            [userID]
        );
    }

    return { userID, ...user };
};

const updateUser = async (userID, user) => {
    await pool.query(
        'UPDATE Users SET image = ?, name = ?, email = ?, password = ?, role = ? WHERE userID = ?',
        [user.image, user.name, user.email, user.password, user.role, userID]
    );
    // Optionally update role-specific tables here
    return { userID, ...user };
};

const deleteUser = async (userID) => {
    await pool.query('DELETE FROM Users WHERE userID = ?', [userID]);
    return { message: 'User deleted' };
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
