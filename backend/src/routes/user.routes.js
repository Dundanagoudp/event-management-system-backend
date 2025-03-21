const express = require('express');
const userController = require('../controllers/user.controller');
const { signupValidator, loginValidator } = require('../validators/user.validator');
const router = express.Router();

router.post('/signup', signupValidator,  userController.signup);
router.post('/login', loginValidator,  userController.login);

module.exports = router;