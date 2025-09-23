const pool = require('../config/db');

const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
};

const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

const createUser = async (user) => {
    const [result] = await pool.query('INSERT INTO users (image, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [user.image, user.name, user.email, user.password, user.role]);
    return { id: result.insertId, ...user };
};

const updateUser = async (id, user) => {
    await pool.query('UPDATE users SET image = ?, name = ?, email = ?, password = ?, role = ? WHERE id = ?', [user.image, user.name, user.email, user.password, user.role, id]);
    return { id, ...user };
};

const deleteUser = async (id) => {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'User deleted' };
};



module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};