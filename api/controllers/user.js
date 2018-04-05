const mongoose = require('mongoose');

const User = require('../models/user');
const Contato = require('../models/contato');

exports.user_signup = async (req, res, next) => {
    try {
        const userResults = await User.find({ email: req.body.email }).exec()
        if (userResults.length >= 1) {
            return res.status(409).send({
                message: `${userResults[0].email} already exists`
            })
        }

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: req.body.password
        })

        await user.save()
        res.status(201).send({
            message: 'User created'
        })
    } catch (err) {
        res.status(400).send({
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

exports.user_update = async (req, res, next) => {
    const { userId } = req.userData;
    const userUpdates = { email, password } = req.body;
    try {
        const user = await User.findById(userId);

        user.set(userUpdates);
        const newUser = await user.save({});
        const token = await newUser.generateAuthToken();

        res.send({ 
            email: newUser.email, 
            id: newUser._id,
            token
        });
    } catch (error) {
        res.status(400).send();
    }
};

exports.user_delete = async (req, res, next) => {
    const { userId } = req.userData;
    try {
        const user = await User.findByIdAndRemove(userId);
        if (!user) {
            return res.status(404).send();
        }

        await Contato.remove({ _creator: userId })
        res.send();
    } catch (error) {
        res.status(400).send();
    }
};
