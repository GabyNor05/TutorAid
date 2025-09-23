const userModel = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

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

exports.createUser = async (req, res) => {
    try {
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "users"
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Remove temp file
        }
        const user = { ...req.body, image: imageUrl };
        const createdUser = await userModel.createUser(user);
        res.json(createdUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        let imageUrl = req.body.image;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "users"
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Remove temp file
        }
        const user = { ...req.body, image: imageUrl };
        const updatedUser = await userModel.updateUser(req.params.id, user);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    userModel.deleteUser(id, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'User deleted' });
    });
};