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
    console.log("Creating user:", user);
    const [result] = await pool.query(
        'INSERT INTO Users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [user.image, user.name, user.email, user.password, user.role]
    );
    const userID = result.insertId;
    console.log("User created with ID:", userID);

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
    const fields = [];
    const values = [];

    if (user.name !== undefined) {
        fields.push('name = ?');
        values.push(user.name);
    }
    if (user.email !== undefined) {
        fields.push('email = ?');
        values.push(user.email);
    }
    if (user.password !== undefined) {
        fields.push('password = ?');
        values.push(user.password);
    }
    if (user.role !== undefined) {
        fields.push('role = ?');
        values.push(user.role);
    }
    if (user.image !== undefined) {
        fields.push('image = ?');
        values.push(user.image);
    }

    if (fields.length === 0) return; // Nothing to update

    values.push(userID);

    const query = `UPDATE Users SET ${fields.join(', ')} WHERE userID = ?`;
    await pool.query(query, values);
};

const deleteUser = async (userID) => {
    await pool.query('DELETE FROM Users WHERE userID = ?', [userID]);
    return { message: 'User deleted' };
};

const createTutor = async (tutor) => {
    await pool.query(
        'INSERT INTO Tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
        [tutor.userID, tutor.bio, tutor.subjects, tutor.qualifications, tutor.availability]
    );
};

const updateTutor = async (userID, tutor) => {
    await pool.query(
        'UPDATE Tutors SET bio = ?, subjects = ?, qualifications = ?, availability = ? WHERE userID = ?',
        [tutor.bio, tutor.subjects, tutor.qualifications, tutor.availability, userID]
    );
};

const createStudent = async (student) => {
    // Check if student row already exists
    const [rows] = await pool.query('SELECT * FROM Students WHERE userID = ?', [student.userID]);
    if (rows.length === 0) {
        await pool.query(
            'INSERT INTO Students (userID, grade, school, address, city, province, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                student.userID,
                student.grade || null,
                student.school || null,
                student.address || null,
                student.city || null,
                student.province || null,
                student.status || "Active"
            ]
        );
    }
    // If it exists, do nothing (or you could update instead)
};

const updateStudent = async (userID, student) => {
    const [result] = await pool.query(
        'UPDATE Students SET grade = ?, school = ?, address = ?, city = ?, province = ?, status = ? WHERE userID = ?',
        [
            student.grade || null,
            student.school || null,
            student.address || null,
            student.city || null,
            student.province || null,
            student.status || "Active",
            userID
        ]
    );
    console.log("Student update result:", result);
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createTutor,
    updateTutor,
    createStudent,
    updateStudent
};
