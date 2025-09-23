const userModel = require('../models/userModel');

exports.getUsers = (req, res) => {
    userModel.getAllUsers((err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.getUser = (req, res) => {
    const id = req.params.id;
    userModel.getUserById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results[0]);
    });
};

exports.createUser = (req, res) => {
    const user = req.body;
    userModel.createUser(user, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: results.insertId, ...user });
    });
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    const user = req.body;
    userModel.updateUser(id, user, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id, ...user });
    });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    userModel.deleteUser(id, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'User deleted' });
    });
};