const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, updateProfile, forgotPassword, resetPassword, verifyOTP } = require('./auth.controller');
const { protect } = require('./auth.middleware');
const passport = require('./passport');
const generateToken = require('./generateToken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOTP);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL || 'http://localhost:5173' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const photo = req.user.photo || '';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}?token=${token}&name=${encodeURIComponent(req.user.fullName)}&photo=${encodeURIComponent(photo)}`);
  }
);

module.exports = router;