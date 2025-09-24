const pool = require('../config/db');

const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT * FROM Users');
    return rows;
};

const getUserById = async (userID) => {
    // Get basic user info
    const [users] = await pool.query('SELECT * FROM Users WHERE userID = ?', [userID]);
    const user = users[0];
    if (!user) return null;

    // If tutor, get extra fields
    if (user.role === "Tutor") {
        const [tutors] = await pool.query(
            'SELECT bio, subjects, qualifications, availability FROM Tutors WHERE userID = ?', [userID]
        );
        if (tutors[0]) {
            return { ...user, ...tutors[0] };
        }
    }

    // If student, you can add similar logic for student fields
    if (user.role === "Student") {
        const [students] = await pool.query(
            'SELECT grade, school, address, city, province, status FROM Students WHERE userID = ?', [userID]
        );
        if (students[0]) {
            return { ...user, ...students[0] };
        }
    }

    return user;
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

const createTutor = async ({ userID, bio, subjects, qualifications, availability }) => {
    await pool.query(
        'INSERT INTO Tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
        [userID, bio, subjects, qualifications, availability]
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

const createTutorAvailability = async ({ tutorID, day_group, start_time, end_time }) => {
    await pool.query(
        'INSERT INTO TutorAvailability (tutorID, day_group, start_time, end_time) VALUES (?, ?, ?, ?)',
        [tutorID, day_group, start_time, end_time]
    );
};

const getUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0];
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
    updateStudent,
    createTutorAvailability,
    getUserByEmail,
};
