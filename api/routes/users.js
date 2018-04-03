const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');

router.post('/', async (req, res, next) => {
    try {
        const userResults = await User.find({ email: req.body.email }).exec()
        if (userResults.length >= 1) {
            return res.status(409).json({
                message: `${userResults[0].email} already exists`
            })
        }

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: req.body.password
        })

        await user.save()
        res.status(201).json({
            message: "User created"
        })
    } catch (err) {
        res.status(400).json({
            error: err.errors
        })
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({
            email: user.email,
            id: user._id,
            token
        });
    } catch (err) {
        res.status(401).send();
    }
});

module.exports = router;
