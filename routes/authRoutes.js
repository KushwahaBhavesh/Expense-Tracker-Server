const express = require('express');
const router = express.Router();
const { register, login, updateProfile, updateCurrency } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.put('/currency', protect, updateCurrency);

module.exports = router; 