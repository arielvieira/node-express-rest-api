const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');
const UserController = require('../controllers/user');

const checkAuth = require('../middlewares/checkAuth');

router.post('/', UserController.user_signup);

router.post('/login', UserController.user_login);

router.delete('/me', checkAuth, UserController.user_delete);

module.exports = router;
