const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getUser,
  updateProfile,
  updateCurrency
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getUser);
router.put('/profile', protect, updateProfile);
router.put('/currency', protect, updateCurrency);

module.exports = router; 