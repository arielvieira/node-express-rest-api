const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Path {value} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    }
});

userSchema.methods.generateAuthToken = function () {
    const user = this;

    return new Promise((resolve, reject) => {
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toHexString()
            },
            '123', {
                expiresIn: "1h"
            }
        );
        resolve(token);
    })
};


userSchema.statics.findByCredentials = function (email, password) {
    const User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (!result) return reject()

                resolve(user);
            });
        });
    });
};

userSchema.pre('save', function (next) {
    const user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else next()
});

module.exports = mongoose.model('User', userSchema);