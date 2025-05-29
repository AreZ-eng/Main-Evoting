const db = require("../models");
const Admin = db.admin;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const config = require("../configs/auth.config");

exports.signin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const admin = await Admin.findOne({ where: { username: req.body.username } });
        if (!admin) {
            return res.status(404).send({ message: "Admin not found." });
        }
 
        const password = bcrypt.compareSync(req.body.password, admin.password);
        if (!password) {
            return res.status(401).send({ accessToken: null, message: "Invalid password!" });
        }
 
        const token = jwt.sign({ id: admin.id, nama: admin.username }, config.secret, { expiresIn: 1800 });
 
        return res.status(200).send({
            id: admin.id,
            nama: admin.username,
            accessToken: token,
        });
    } catch (error) {
        console.error("Error during signin:", error);
        return res.status(500).send({ message: "An error occurred during signin." });
    }
 };
 
