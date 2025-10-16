const pool = require('../config/db');

// Get all users
const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

const getUserById = async (userID) => {
  // basic user
  const [users] = await pool.query('SELECT * FROM users WHERE userID = ?', [userID]);
  const user = users[0];
  if (!user) return null;

  if (user.role === 'Tutor') {
    const [tutors] = await pool.query(
      'SELECT bio, subjects, qualifications, availability FROM tutors WHERE userID = ?',
      [userID]
    );
    if (tutors[0]) return { ...user, ...tutors[0] };
  }

  if (user.role === 'Student') {
    const [students] = await pool.query(
      'SELECT grade, school, address, city, province, status FROM students WHERE userID = ?',
      [userID]
    );
    if (students[0]) return { ...user, ...students[0] };
  }

  return user;
};

const createUser = async (user) => {
  console.log('Creating user:', user);
  const [result] = await pool.query(
    'INSERT INTO users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [user.image, user.name, user.email, user.password, user.role]
  );
  const userID = result.insertId;
  console.log('User created with ID:', userID);

  if (user.role === 'Tutor') {
    await pool.query(
      'INSERT INTO tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
      [userID, user.bio || '', user.subjects || '', user.qualifications || '', user.availability || '']
    );
  } else if (user.role === 'Student') {
    await pool.query(
      'INSERT INTO students (userID, grade, school, address, status) VALUES (?, ?, ?, ?, ?)',
      [userID, user.grade || '', user.school || '', user.address || '', user.status || 'Active']
    );
  } else if (user.role === 'Admin') {
    await pool.query('INSERT INTO admins (userID) VALUES (?)', [userID]);
  }

  return { userID, ...user };
};

const updateUser = async (userID, user) => {
  const fields = [];
  const values = [];

  if (user.name !== undefined) { fields.push('name = ?'); values.push(user.name); }
  if (user.email !== undefined) { fields.push('email = ?'); values.push(user.email); }
  if (user.password !== undefined) { fields.push('password = ?'); values.push(user.password); }
  if (user.role !== undefined) { fields.push('role = ?'); values.push(user.role); }
  if (user.image !== undefined) { fields.push('image = ?'); values.push(user.image); }

  if (!fields.length) return;

  values.push(userID);
  const query = `UPDATE users SET ${fields.join(', ')} WHERE userID = ?`;
  await pool.query(query, values);
};

const deleteUser = async (userID) => {
  await pool.query('DELETE FROM users WHERE userID = ?', [userID]);
  return { message: 'User deleted' };
};

const createTutor = async ({ userID, bio, subjects, qualifications, availability }) => {
  await pool.query(
    'INSERT INTO tutors (userID, bio, subjects, qualifications, availability) VALUES (?, ?, ?, ?, ?)',
    [userID, bio, subjects, qualifications, availability]
  );
};

const updateTutor = async (userID, tutor) => {
  await pool.query(
    'UPDATE tutors SET bio = ?, subjects = ?, qualifications = ?, availability = ? WHERE userID = ?',
    [tutor.bio, tutor.subjects, tutor.qualifications, tutor.availability, userID]
  );
};

const createStudent = async (student) => {
  const [rows] = await pool.query('SELECT * FROM students WHERE userID = ?', [student.userID]);
  if (!rows.length) {
    await pool.query(
      'INSERT INTO students (userID, grade, school, address, city, province, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        student.userID,
        student.grade || null,
        student.school || null,
        student.address || null,
        student.city || null,
        student.province || null,
        student.status || 'Active',
      ]
    );
  }
};

const updateStudent = async (userID, student) => {
  const [result] = await pool.query(
    'UPDATE students SET grade = ?, school = ?, address = ?, city = ?, province = ?, status = ? WHERE userID = ?',
    [
      student.grade || null,
      student.school || null,
      student.address || null,
      student.city || null,
      student.province || null,
      student.status || 'Active',
      userID,
    ]
  );
  console.log('Student update result:', result);
};

const createTutorAvailability = async ({ tutorID, day_group, start_time, end_time }) => {
  await pool.query(
    'INSERT INTO tutoravailability (tutorID, day_group, start_time, end_time) VALUES (?, ?, ?, ?)',
    [tutorID, day_group, start_time, end_time]
  );
};

const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT userID, name, email, password, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
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
