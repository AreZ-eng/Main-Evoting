const db = require("../models");
const Admin = db.admin;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const config = require("../configs/auth.config");

exports.signin = async (req, res) => {
    console.log(`[AUTH] signin - User: ${req.body.nama || 'unknown'}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`[AUTH] signin - Validation errors for username: ${req.body.username}`);
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const admin = await Admin.findOne({ where: { username: req.body.username } });
        if (!admin) {
            console.log(`[AUTH] signin - Admin not found: ${req.body.username}`);
            return res.status(404).send({ message: "Admin not found." });
        }
 
        const password = bcrypt.compareSync(req.body.password, admin.password);
        if (!password) {
            console.log(`[AUTH] signin - Invalid password for username: ${req.body.username}`);
            return res.status(401).send({ accessToken: null, message: "Invalid password!" });
        }
 
        const token = jwt.sign(
            { 
                id: admin.id,
                nama: admin.username,
                role: admin.role || 'admin',
                aud: 'e-voting-app',
                iss: 'main-api',
                jti: require('crypto').randomBytes(16).toString('hex')
            }, 
            config.secret, 
            { 
                expiresIn: 1800,
                // notBefore: Math.floor(Date.now() / 1000)
            }
        );

        console.log(`[AUTH] signin - Success for username: ${req.body.username}`);
        return res.status(200).send({
            id: admin.id,
            nama: admin.username,
            accessToken: token,
        });
    } catch (error) {
        console.error("Error during signin:", error);
        console.log(`[AUTH] signin - Error for username: ${req.body.username}`);
        return res.status(500).send({ message: "An error occurred during signin." });
    }
 };
 
