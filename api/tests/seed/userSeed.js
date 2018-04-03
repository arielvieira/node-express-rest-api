const mongoose = require('mongoose');

const User = require('./../../models/user');

const users = [
    {
        _id: new mongoose.Types.ObjectId(),
        email: 'ariel@gmail.com',
        password: 'zxc123@'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        email: 'neil@gmail.com',
        password: 'qw48e!!'
    }
];

const populateUsers = (done) => {
    User.remove({})
        .then(() => {
            const userOne = new User(users[0]).save();
            const userTwo = new User(users[1]).save();
            return Promise.all([userOne, userTwo]);
        })
        .then(() => done())
        .catch((err) => done(err));
}

module.exports = { users, populateUsers };
