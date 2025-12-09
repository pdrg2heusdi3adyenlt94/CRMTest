const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', protect, getProfile);

module.exports = router;