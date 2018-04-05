const mongoose = require('mongoose');

const User = require('../models/user');
const Contato = require('../models/contato');

exports.user_signup = async (req, res, next) => {
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
            message: 'User created'
        })
    } catch (err) {
        res.status(400).json({
            error: err.errors
        })
    }
};

exports.user_login = async (req, res, next) => {
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
};

exports.user_delete = async (req, res, next) => {
    const { userId } = req.userData;
    try {
        const user = await User.findByIdAndRemove(userId);
        if (!user) {
            return res.status(404).json();
        }

        await Contato.remove({ _creator: userId })
        res.status(200).json();
    } catch (error) {
        res.status(400).json();
    }
};
